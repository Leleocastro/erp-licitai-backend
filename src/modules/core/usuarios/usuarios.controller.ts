import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Usuario } from './entities/usuario.entity';

@ApiTags('Core - Usuários')
@Controller('core/usuarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll(): Promise<Usuario[]> {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um usuário' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Usuario> {
    return this.usuariosService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados de um usuário' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover (soft delete) um usuário' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usuariosService.remove(id);
  }
}
