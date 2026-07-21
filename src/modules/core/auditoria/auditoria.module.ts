import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Auditoria])],
  providers: [AuditoriaService],
  controllers: [AuditoriaController],
  exports: [AuditoriaService, TypeOrmModule],
})
export class AuditoriaModule {}
