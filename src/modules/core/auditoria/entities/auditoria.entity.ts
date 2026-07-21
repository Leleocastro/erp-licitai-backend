import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('auditoria')
@Index('idx_auditoria_usuario', ['usuario_id'])
@Index('idx_auditoria_orgao', ['orgao_id'])
@Index('idx_auditoria_recurso', ['recurso'])
@Index('idx_auditoria_created', ['created_at'])
@Index('idx_auditoria_acao', ['acao'])
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuario_id: string;

  @Column({ name: 'orgao_id', type: 'uuid', nullable: true })
  orgao_id: string;

  @Column({ length: 100 })
  acao: string;

  @Column({ length: 100 })
  recurso: string;

  @Column({ name: 'recurso_id', type: 'uuid', nullable: true })
  recurso_id: string;

  @Column({ name: 'dados_antes', type: 'jsonb', nullable: true })
  dados_antes: Record<string, any>;

  @Column({ name: 'dados_depois', type: 'jsonb', nullable: true })
  dados_depois: Record<string, any>;

  @Column({ length: 45, nullable: true })
  ip: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
