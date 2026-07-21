import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orgao } from './entities/orgao.entity';
import { OrgaosController } from './orgaos.controller';
import { OrgaosService } from './orgaos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Orgao])],
  controllers: [OrgaosController],
  providers: [OrgaosService],
  exports: [TypeOrmModule, OrgaosService],
})
export class OrgaosModule {}
