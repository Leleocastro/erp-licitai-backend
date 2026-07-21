import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { OrgaosModule } from './orgaos/orgaos.module';

@Module({
  imports: [AuthModule, UsuariosModule, OrgaosModule],
  exports: [AuthModule, UsuariosModule, OrgaosModule],
})
export class CoreModule {}
