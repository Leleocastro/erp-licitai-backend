import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Permissao } from '../../permissoes/entities/permissao.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ nullable: true })
  orgao_id: string;

  @Column({ nullable: true })
  role_pai_id: string;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'role_pai_id' })
  role_pai: Role;

  @Column({ default: false })
  sistema: boolean;

  @ManyToMany(() => Permissao)
  @JoinTable({
    name: 'role_permissao',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissao_id', referencedColumnName: 'id' },
  })
  permissoes: Permissao[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
