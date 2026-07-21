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
    const usuario = await this.usuariosService.findOneComRoles(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    if (usuario.status !== 'ativo') {
      throw new UnauthorizedException('Conta não está ativa');
    }
    const roles =
      usuario.usuarioRoles?.map((ur) => ur.role?.nome).filter(Boolean) || [];

    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      status: usuario.status,
      roles,
    };
  }
}
