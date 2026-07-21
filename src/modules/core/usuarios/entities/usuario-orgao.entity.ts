import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Orgao } from '../../orgaos/entities/orgao.entity';

@Entity('usuario_orgao')
export class UsuarioOrgao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuario_id: string;

  @Column()
  orgao_id: string;

  @Column({ default: false })
  principal: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioOrgaos)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Orgao, (orgao) => orgao.usuarioOrgaos)
  @JoinColumn({ name: 'orgao_id' })
  orgao: Orgao;
}
