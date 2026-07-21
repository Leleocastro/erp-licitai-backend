import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { UsuarioOrgao } from '../../usuarios/entities/usuario-orgao.entity';

@Entity('orgaos')
export class Orgao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 18, unique: true })
  @Index()
  cnpj: string;

  @Column({ length: 255 })
  razao_social: string;

  @Column({ length: 255, nullable: true })
  nome_fantasia: string;

  @Column({ length: 20 })
  esfera: string;

  @Column({ type: 'jsonb', nullable: true })
  endereco: Record<string, any>;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => UsuarioOrgao, (uo) => uo.orgao)
  usuarioOrgaos: UsuarioOrgao[];
}
