import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { OrgaosModule } from './orgaos/orgaos.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [AuthModule, UsuariosModule, OrgaosModule, RolesModule],
  exports: [AuthModule, UsuariosModule, OrgaosModule, RolesModule],
})
export class CoreModule {}
