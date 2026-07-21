import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkPermissoesDto {
  @ApiProperty({
    description: 'IDs das permissoes a vincular',
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  permissao_ids: string[];
}
