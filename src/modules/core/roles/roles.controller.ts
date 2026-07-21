import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { LinkPermissoesDto } from './dto/link-permissoes.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('Core - Roles')
@ApiBearerAuth()
@Controller('core/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('role:gerenciar')
  @ApiOperation({ summary: 'Criar nova role' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('role:gerenciar')
  @ApiOperation({ summary: 'Listar roles' })
  findAll(@Query('orgao_id') orgao_id?: string) {
    return this.rolesService.findAll(orgao_id);
  }

  @Get(':id')
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('role:gerenciar')
  @ApiOperation({ summary: 'Obter role por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('role:gerenciar')
  @ApiOperation({ summary: 'Atualizar role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('role:gerenciar')
  @ApiOperation({ summary: 'Remover role (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissoes')
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('permissao:atribuir')
  @ApiOperation({ summary: 'Vincular permissoes a uma role' })
  linkPermissoes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkPermissoesDto,
  ) {
    return this.rolesService.linkPermissoes(id, dto);
  }

  @Get(':id/permissoes')
  @Roles('admin_orgao', 'admin_sistema')
  @Permissions('permissao:atribuir')
  @ApiOperation({ summary: 'Listar permissoes (com heranca) de uma role' })
  getPermissoes(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.getPermissoes(id);
  }
}
