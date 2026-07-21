import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Nome completo do usuário' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nome: string;

  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'CPF do usuário (somente números ou formatado)' })
  @IsString()
  cpf: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  @MinLength(6)
  senha: string;

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

  @ApiPropertyOptional({
    description: 'IDs dos órgãos aos quais o usuário pertence',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  orgaos_ids?: string[];
}
