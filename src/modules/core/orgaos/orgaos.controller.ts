import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { OrgaosService } from './orgaos.service';
import { CreateOrgaoDto } from './dto/create-orgao.dto';
import { UpdateOrgaoDto } from './dto/update-orgao.dto';
import { QueryOrgaoDto } from './dto/query-orgao.dto';

@ApiTags('Orgaos')
@ApiBearerAuth()
@Controller('core/orgaos')
export class OrgaosController {
  constructor(private readonly orgaosService: OrgaosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo orgao (tenant)' })
  @ApiResponse({ status: 201, description: 'Orgao criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'CNPJ ja cadastrado.' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Contexto do tenant (opcional)',
    required: false,
  })
  async criar(
    @Body() dto: CreateOrgaoDto,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.orgaosService.criar(dto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar orgaos com paginacao' })
  @ApiResponse({ status: 200, description: 'Lista de orgaos paginada.' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Contexto do tenant (opcional)',
    required: false,
  })
  async listar(
    @Query() query: QueryOrgaoDto,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.orgaosService.listar(query, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhe de orgao' })
  @ApiResponse({ status: 200, description: 'Orgao encontrado.' })
  @ApiResponse({ status: 404, description: 'Orgao nao encontrado.' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Contexto do tenant (opcional)',
    required: false,
  })
  async buscarPorId(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.orgaosService.buscarPorId(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar orgao' })
  @ApiResponse({ status: 200, description: 'Orgao atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Orgao nao encontrado.' })
  @ApiResponse({ status: 409, description: 'CNPJ ja cadastrado por outro orgao.' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Contexto do tenant (opcional)',
    required: false,
  })
  async atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateOrgaoDto,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.orgaosService.atualizar(id, dto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover orgao (soft delete)' })
  @ApiResponse({ status: 204, description: 'Orgao removido.' })
  @ApiResponse({ status: 404, description: 'Orgao nao encontrado.' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Contexto do tenant (opcional)',
    required: false,
  })
  async remover(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<void> {
    return this.orgaosService.remover(id, tenantId);
  }
}
