import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orgao } from './entities/orgao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orgao])],
  exports: [TypeOrmModule],
})
export class OrgaosModule {}
