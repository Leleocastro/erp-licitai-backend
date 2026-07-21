import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { FiltrarAuditoriaDto } from './dto/filtrar-auditoria.dto';
import { Auditoria } from './entities/auditoria.entity';

@ApiTags('Auditoria')
@Controller('core/auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiOkResponse({ type: [Auditoria] })
  async listar(@Query() filtros: FiltrarAuditoriaDto) {
    return this.auditoriaService.listar(filtros);
  }
}
