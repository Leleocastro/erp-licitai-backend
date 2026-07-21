import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import jwtConfig from '../../../config/jwt.config';

const BLOQUEIO_PREFIX = 'rate_limit:';
const REFRESH_PREFIX = 'refresh_token:';
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MINUTOS = 30;
const REFRESH_TOKEN_DIAS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject('REDIS_CLIENT')
    private redis: Redis,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, senha } = loginDto;

    await this.verificarBloqueio(email);

    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) {
      await this.registrarTentativaFalha(email);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      await this.registrarTentativaFalha(email);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.limparTentativas(email);
    await this.usuariosService.atualizarUltimoLogin(usuario.id);

    return this.gerarTokens(usuario);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfiguration.refreshSecret,
      });

      if (payload.tipo !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      const tokenValido = await this.redis.get(
        `${REFRESH_PREFIX}${payload.jti}`,
      );
      if (!tokenValido) {
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      const usuario = await this.usuariosService.findOne(payload.sub);
      if (!usuario) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      await this.redis.del(`${REFRESH_PREFIX}${payload.jti}`);

      return this.gerarTokens(usuario);
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfiguration.refreshSecret,
      });
      if (payload.jti) {
        await this.redis.del(`${REFRESH_PREFIX}${payload.jti}`);
      }
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async getMe(usuarioId: string) {
    return this.usuariosService.findOne(usuarioId);
  }

  private async gerarTokens(usuario: any) {
    const jti = uuidv4();

    const roles = usuario.roles?.map((r) => r.nome) || [];
    const permissoes: string[] = [];
    for (const role of usuario.roles || []) {
      const rolePerms = (role as any).permissoes || [];
      for (const perm of rolePerms) {
        if (perm.slug && !permissoes.includes(perm.slug)) {
          permissoes.push(perm.slug);
        }
      }
    }

    const accessToken = this.jwtService.sign(
      {
        sub: usuario.id,
        email: usuario.email,
        tipo: 'access',
        roles,
        permissoes,
      },
      {
        secret: this.jwtConfiguration.accessSecret,
        expiresIn: this.jwtConfiguration.accessExpiresIn as any,
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: usuario.id,
        email: usuario.email,
        tipo: 'refresh',
        jti,
      },
      {
        secret: this.jwtConfiguration.refreshSecret,
        expiresIn: this.jwtConfiguration.refreshExpiresIn as any,
      },
    );

    const refreshExpiresInSeconds = 7 * 24 * 60 * 60;
    await this.redis.set(
      `${REFRESH_PREFIX}${jti}`,
      usuario.id,
      'EX',
      refreshExpiresInSeconds,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        status: usuario.status,
        roles,
        permissoes,
      },
    };
  }

  private async verificarBloqueio(email: string): Promise<void> {
    const chave = `${BLOQUEIO_PREFIX}${email}`;
    const tentativas = await this.redis.get(chave);
    if (tentativas && parseInt(tentativas, 10) >= MAX_TENTATIVAS) {
      const ttl = await this.redis.ttl(chave);
      const minutos = Math.ceil(ttl / 60);
      throw new UnauthorizedException(
        `Conta temporariamente bloqueada. Tente novamente em ${minutos} minuto(s).`,
      );
    }
  }

  private async registrarTentativaFalha(email: string): Promise<void> {
    const chave = `${BLOQUEIO_PREFIX}${email}`;
    const tentativas = await this.redis.incr(chave);
    if (tentativas === 1) {
      await this.redis.expire(chave, BLOQUEIO_MINUTOS * 60);
    }
  }

  private async limparTentativas(email: string): Promise<void> {
    const chave = `${BLOQUEIO_PREFIX}${email}`;
    await this.redis.del(chave);
  }
}
