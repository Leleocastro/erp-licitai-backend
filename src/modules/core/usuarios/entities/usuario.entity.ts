import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { UsuarioOrgao } from './usuario-orgao.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 14, unique: true })
  cpf: string;

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

  @Column({
    length: 20,
    default: 'pendente',
  })
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
}
