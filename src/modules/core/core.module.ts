import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { PermissoesModule } from './permissoes/permissoes.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { OrgaosModule } from './orgaos/orgaos.module';
import { Role } from './roles/entities/role.entity';
import { Permissao } from './permissoes/entities/permissao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permissao]),
    AuthModule,
    UsuariosModule,
    OrgaosModule,
    RolesModule,
    PermissoesModule,
  ],
  exports: [
    AuthModule,
    UsuariosModule,
    OrgaosModule,
    RolesModule,
    PermissoesModule,
  ],
})
export class CoreModule {}
