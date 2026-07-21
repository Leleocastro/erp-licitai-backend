import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UsuarioOrgao } from './usuario-orgao.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  @Index()
  email: string;

  @Column({ length: 14, unique: true })
  @Index()
  cpf: string;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 255 })
  senha_hash: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({ length: 100, nullable: true })
  lotacao: string;

  @Column({ length: 50, nullable: true })
  matricula: string;

  @Column({ default: false })
  mfa_enabled: boolean;

  @Column({ length: 255, nullable: true })
  mfa_secret: string;

  @Column({ length: 20, default: 'pendente' })
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  ultimo_login: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => UsuarioOrgao, (uo) => uo.usuario)
  usuarioOrgaos: UsuarioOrgao[];

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'usuario_role',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
