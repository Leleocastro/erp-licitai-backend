import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissaoDto {
  @ApiProperty({ description: 'Recurso (ex: usuario, role, relatorio)' })
  @IsString()
  recurso: string;

  @ApiProperty({ description: 'Acao (ex: criar, ler, atualizar, deletar)' })
  @IsString()
  acao: string;

  @ApiPropertyOptional({ description: 'Descricao da permissao' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ description: 'Modulo (ex: core, contabil, gestao)' })
  @IsOptional()
  @IsString()
  modulo?: string;
}
