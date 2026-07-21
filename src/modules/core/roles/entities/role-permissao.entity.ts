import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('role_permissao')
export class RolePermissao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  role_id: string;

  @Column()
  permissao_id: string;
}
