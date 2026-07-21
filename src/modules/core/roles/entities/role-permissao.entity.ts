import { Entity, PrimaryColumn } from 'typeorm';

@Entity('role_permissao')
export class RolePermissao {
  @PrimaryColumn()
  role_id: string;

  @PrimaryColumn()
  permissao_id: string;
}
