import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ description: 'Nome completo do usuário' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nome?: string;

  @ApiPropertyOptional({ description: 'Email do usuário' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'CPF do usuário (11 dígitos, somente números)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos' })
  cpf?: string;

  @ApiPropertyOptional({ description: 'Nova senha do usuário' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;

  @ApiPropertyOptional({ description: 'Telefone do usuário' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({ description: 'Cargo do usuário' })
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiPropertyOptional({ description: 'Lotação do usuário' })
  @IsOptional()
  @IsString()
  lotacao?: string;

  @ApiPropertyOptional({ description: 'Matrícula do usuário' })
  @IsOptional()
  @IsString()
  matricula?: string;

  @ApiPropertyOptional({ description: 'Status do usuário' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'IDs dos órgãos aos quais o usuário pertence',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  orgaos_ids?: string[];
}
