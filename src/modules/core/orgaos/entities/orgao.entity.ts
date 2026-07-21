import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum EsferaEnum {
  FEDERAL = 'federal',
  ESTADUAL = 'estadual',
  MUNICIPAL = 'municipal',
}

export interface Endereco {
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

@Entity('orgaos')
@Index('idx_orgaos_tenant_id', ['tenantId'])
export class Orgao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_orgaos_cnpj')
  @Column({ type: 'varchar', length: 18, unique: true })
  cnpj: string;

  @Column({ name: 'razao_social', type: 'varchar', length: 255 })
  razaoSocial: string;

  @Column({ name: 'nome_fantasia', type: 'varchar', length: 255, nullable: true })
  nomeFantasia: string;

  @Index('idx_orgaos_esfera')
  @Column({ type: 'enum', enum: EsferaEnum })
  esfera: EsferaEnum;

  @Column({ type: 'jsonb', nullable: true })
  endereco: Endereco;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;
}
