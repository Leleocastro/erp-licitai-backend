import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UsuarioRole } from './entities/usuario-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, UsuarioRole])],
  exports: [TypeOrmModule],
})
export class RolesModule {}
