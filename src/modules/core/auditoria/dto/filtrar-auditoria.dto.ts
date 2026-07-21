import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltrarAuditoriaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  usuario_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orgao_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recurso?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  acao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number = 20;
}
