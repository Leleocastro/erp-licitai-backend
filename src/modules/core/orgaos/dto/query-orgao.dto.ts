import { IsOptional, IsInt, Min, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryOrgaoDto {
  @ApiPropertyOptional({ description: 'Pagina (comeca em 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por pagina', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number = 10;

  @ApiPropertyOptional({ description: 'Filtrar por CNPJ' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiPropertyOptional({ description: 'Filtrar por razao social (busca parcial)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  razaoSocial?: string;

  @ApiPropertyOptional({ description: 'Filtrar por esfera' })
  @IsOptional()
  @IsString()
  esfera?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ativo' })
  @IsOptional()
  @IsString()
  ativo?: string;
}
