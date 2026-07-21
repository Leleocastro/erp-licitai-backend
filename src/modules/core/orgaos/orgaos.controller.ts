import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
  @ApiOperation({ summary: 'Criar novo orgao' })
  @ApiResponse({ status: 201, description: 'Orgao criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'CNPJ ja cadastrado.' })
  async criar(@Body() dto: CreateOrgaoDto) {
    return this.orgaosService.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar orgaos com paginacao' })
  @ApiResponse({ status: 200, description: 'Lista de orgaos paginada.' })
  async listar(@Query() query: QueryOrgaoDto) {
    return this.orgaosService.listar(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhe de orgao' })
  @ApiResponse({ status: 200, description: 'Orgao encontrado.' })
  @ApiResponse({ status: 404, description: 'Orgao nao encontrado.' })
  async buscarPorId(@Param('id') id: string) {
    return this.orgaosService.buscarPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar orgao' })
  @ApiResponse({ status: 200, description: 'Orgao atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Orgao nao encontrado.' })
  @ApiResponse({ status: 409, description: 'CNPJ ja cadastrado por outro orgao.' })
  async atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateOrgaoDto,
  ) {
    return this.orgaosService.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover orgao (soft delete)' })
  @ApiResponse({ status: 204, description: 'Orgao removido.' })
  @ApiResponse({ status: 404, description: 'Orgao nao encontrado.' })
  async remover(@Param('id') id: string): Promise<void> {
    return this.orgaosService.remover(id);
  }
}
