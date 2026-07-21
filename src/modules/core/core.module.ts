import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { PermissoesModule } from './permissoes/permissoes.module';
import { Role } from './roles/entities/role.entity';
import { Permissao } from './permissoes/entities/permissao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permissao]),
    RolesModule,
    PermissoesModule,
  ],
  exports: [RolesModule, PermissoesModule],
})
export class CoreModule {}
