import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissoesController } from './permissoes.controller';
import { PermissoesService } from './permissoes.service';
import { Permissao } from './entities/permissao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permissao])],
  controllers: [PermissoesController],
  providers: [PermissoesService],
  exports: [PermissoesService],
})
export class PermissoesModule {}
