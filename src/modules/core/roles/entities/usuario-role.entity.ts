import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Role } from './role.entity';

@Entity('usuario_role')
export class UsuarioRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuario_id: string;

  @Column()
  role_id: string;

  @Column({ nullable: true })
  orgao_id: string;

  @Column({ nullable: true })
  atribuido_por: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioRoles)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Role, (role) => role.usuarioRoles)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
