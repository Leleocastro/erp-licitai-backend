import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('permissoes')
export class Permissao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  recurso: string;

  @Column({ length: 50 })
  acao: string;

  @Column({ length: 150, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ length: 50, default: 'core' })
  modulo: string;

  @CreateDateColumn()
  created_at: Date;
}
