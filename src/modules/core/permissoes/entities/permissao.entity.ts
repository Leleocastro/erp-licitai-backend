import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('permissoes')
export class Permissao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  recurso: string;

  @Column({ length: 50 })
  acao: string;

  @Column({ length: 150, unique: true, insert: false, update: false })
  slug: string;

  @Column('text', { nullable: true })
  descricao: string;

  @Column({ length: 50, default: 'core' })
  modulo: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
