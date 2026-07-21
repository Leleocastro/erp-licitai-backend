import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class EnderecoDto {
  @ApiProperty({ description: 'Logradouro', example: 'Rua Exemplo' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  logradouro: string;

  @ApiPropertyOptional({ description: 'Numero', example: '123' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numero?: string;

  @ApiPropertyOptional({ description: 'Complemento', example: 'Sala 5' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  complemento?: string;

  @ApiProperty({ description: 'Bairro', example: 'Centro' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  bairro: string;

  @ApiProperty({ description: 'Cidade', example: 'Sao Paulo' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  cidade: string;

  @ApiProperty({ description: 'UF', example: 'SP' })
  @IsString()
  @Matches(/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/, {
    message: 'UF deve ser uma sigla valida (ex: SP, RJ, MG)',
  })
  uf: string;

  @ApiProperty({ description: 'CEP', example: '01000-000' })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato 00000-000 ou 00000000',
  })
  cep: string;
}

export class CreateOrgaoDto {
  @ApiProperty({
    description: 'CNPJ do orgao',
    example: '00.000.000/0001-00',
  })
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, {
    message: 'CNPJ deve estar no formato 00.000.000/0001-00 ou 14 digitos',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Razao social do orgao',
    example: 'Prefeitura Municipal de Sao Paulo',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  razaoSocial: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia do orgao',
    example: 'Prefeitura de Sao Paulo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nomeFantasia?: string;

  @ApiProperty({
    description: 'Esfera do orgao',
    example: 'municipal',
  })
  @IsString()
  esfera: string;

  @ApiPropertyOptional({
    description: 'Endereco do orgao',
    type: EnderecoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco?: EnderecoDto;

  @ApiPropertyOptional({
    description: 'Telefone do orgao',
    example: '(11) 99999-9999',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Email do orgao',
    example: 'contato@prefeitura.gov.br',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'URL do logo do orgao',
    example: 'https://storage.example.com/logos/logo.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Status ativo/inativo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({
    description: 'ID do tenant (orgao pai) para contexto multi-tenant',
    example: 'uuid-do-orgao-pai',
  })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
