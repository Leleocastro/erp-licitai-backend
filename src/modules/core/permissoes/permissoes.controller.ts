import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissoesService } from './permissoes.service';
import { CreatePermissaoDto } from './dto/create-permissao.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';

@ApiTags('Core - Permissoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('core/permissoes')
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) {}

  @Post()
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('permissao:atribuir')
  @ApiOperation({ summary: 'Criar nova permissao' })
  create(@Body() dto: CreatePermissaoDto) {
    return this.permissoesService.create(dto);
  }

  @Get()
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('permissao:atribuir')
  @ApiOperation({ summary: 'Listar permissoes' })
  findAll(@Query('modulo') modulo?: string) {
    return this.permissoesService.findAll(modulo);
  }
}
