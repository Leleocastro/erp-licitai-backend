import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Nome da role' })
  @IsString()
  nome: string;

  @ApiPropertyOptional({ description: 'Descricao da role' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ description: 'ID do orgao' })
  @IsOptional()
  @IsUUID()
  orgao_id?: string;

  @ApiPropertyOptional({ description: 'ID da role pai (heranca)' })
  @IsOptional()
  @IsUUID()
  role_pai_id?: string;

  @ApiPropertyOptional({ description: 'Role de sistema (nao removivel)' })
  @IsOptional()
  @IsBoolean()
  sistema?: boolean;
}
