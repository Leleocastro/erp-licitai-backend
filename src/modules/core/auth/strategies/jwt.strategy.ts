import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../../../config/jwt.config';
import { UsuariosService } from '../../usuarios/usuarios.service';

interface JwtPayload {
  sub: string;
  email: string;
  tipo: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfiguration.accessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.usuariosService.findOneComRolesPermissoes(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    if (usuario.status !== 'ativo') {
      throw new UnauthorizedException('Conta não está ativa');
    }

    const roles = usuario.roles?.map((r) => r.nome).filter(Boolean) || [];

    const permSet = new Set<string>();
    if (usuario.roles) {
      for (const role of usuario.roles) {
        if (role.permissoes) {
          for (const perm of role.permissoes) {
            permSet.add(perm.slug);
          }
        }
      }
    }
    const permissoes = Array.from(permSet);

    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      status: usuario.status,
      roles,
      permissoes,
    };
  }
}
