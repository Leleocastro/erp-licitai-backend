import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { UsuarioOrgao } from './entities/usuario-orgao.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(UsuarioOrgao)
    private usuarioOrgaoRepository: Repository<UsuarioOrgao>,
    private dataSource: DataSource,
  ) {}

  private validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

    return true;
  }

  private formatarCPF(cpf: string): string {
    const numeros = cpf.replace(/\D/g, '');
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { senha, orgaos_ids, ...dados } = createUsuarioDto;

    const cpfLimpo = dados.cpf.replace(/\D/g, '');
    if (!this.validarCPF(cpfLimpo)) {
      throw new BadRequestException('CPF inválido');
    }
    const cpfFormatado = this.formatarCPF(cpfLimpo);

    const emailExistente = await this.usuariosRepository.findOne({
      where: { email: dados.email },
    });
    if (emailExistente) {
      throw new ConflictException('Email já cadastrado');
    }

    const cpfExistente = await this.usuariosRepository.findOne({
      where: { cpf: cpfFormatado },
    });
    if (cpfExistente) {
      throw new ConflictException('CPF já cadastrado');
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const usuario = this.usuariosRepository.create({
        ...dados,
        cpf: cpfFormatado,
        senha_hash,
      });

      const saved = await queryRunner.manager.save(usuario);

      if (orgaos_ids && orgaos_ids.length > 0) {
        const vinculos = orgaos_ids.map((orgao_id, index) =>
          this.usuarioOrgaoRepository.create({
            usuario_id: saved.id,
            orgao_id,
            principal: index === 0,
          }),
        );
        await queryRunner.manager.save(vinculos);
      }

      await queryRunner.commitTransaction();
      return this.usuariosRepository.findOneOrFail({
        where: { id: saved.id },
        relations: ['usuarioOrgaos', 'usuarioOrgaos.orgao'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      relations: ['usuarioOrgaos', 'usuarioOrgaos.orgao'],
    });
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      relations: [
        'usuarioOrgaos',
        'usuarioOrgaos.orgao',
        'roles',
        'roles.permissoes',
      ],
    });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async findOneComRolesPermissoes(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      relations: [
        'usuarioOrgaos',
        'usuarioOrgaos.orgao',
        'roles',
        'roles.permissoes',
      ],
    });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissoes'],
    });
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);
    const { senha, orgaos_ids, ...dados } = updateUsuarioDto;

    if (dados.cpf) {
      const cpfLimpo = dados.cpf.replace(/\D/g, '');
      if (!this.validarCPF(cpfLimpo)) {
        throw new BadRequestException('CPF inválido');
      }
      dados.cpf = this.formatarCPF(cpfLimpo);

      const cpfExistente = await this.usuariosRepository.findOne({
        where: { cpf: dados.cpf },
      });
      if (cpfExistente && cpfExistente.id !== id) {
        throw new ConflictException('CPF já cadastrado para outro usuário');
      }
    }

    if (dados.email) {
      const emailExistente = await this.usuariosRepository.findOne({
        where: { email: dados.email },
      });
      if (emailExistente && emailExistente.id !== id) {
        throw new ConflictException('Email já cadastrado para outro usuário');
      }
    }

    if (senha) {
      (dados as any).senha_hash = await bcrypt.hash(senha, 10);
    }

    await this.usuariosRepository.update(id, {
      ...dados,
      senha_hash: (dados as any).senha_hash || usuario.senha_hash,
    });

    if (orgaos_ids !== undefined) {
      await this.usuarioOrgaoRepository.delete({ usuario_id: id });

      if (orgaos_ids.length > 0) {
        const vinculos = orgaos_ids.map((orgao_id, index) =>
          this.usuarioOrgaoRepository.create({
            usuario_id: id,
            orgao_id,
            principal: index === 0,
          }),
        );
        await this.usuarioOrgaoRepository.save(vinculos);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuariosRepository.softRemove(usuario);
  }

  async bloquear(id: string): Promise<void> {
    await this.usuariosRepository.update(id, { status: 'bloqueado' });
  }

  async atualizarStatus(id: string, status: string): Promise<void> {
    await this.usuariosRepository.update(id, { status });
  }

  async atualizarUltimoLogin(id: string): Promise<void> {
    await this.usuariosRepository.update(id, {
      ultimo_login: new Date(),
    });
  }
}
