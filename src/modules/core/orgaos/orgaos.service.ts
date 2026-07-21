import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orgao } from './entities/orgao.entity';
import { CreateOrgaoDto } from './dto/create-orgao.dto';
import { UpdateOrgaoDto } from './dto/update-orgao.dto';
import { QueryOrgaoDto } from './dto/query-orgao.dto';

@Injectable()
export class OrgaosService {
  private readonly logger = new Logger(OrgaosService.name);

  constructor(
    @InjectRepository(Orgao)
    private readonly orgaoRepository: Repository<Orgao>,
  ) {}

  async criar(dto: CreateOrgaoDto): Promise<Orgao> {
    this.logger.log(`Criando orgao: ${dto.cnpj}`);

    const cnpjLimpo = dto.cnpj.replace(/\D/g, '');

    const existente = await this.orgaoRepository.findOne({
      where: { cnpj: cnpjLimpo },
      withDeleted: true,
    });
    if (existente) {
      throw new ConflictException('CNPJ ja cadastrado');
    }

    const orgao = this.orgaoRepository.create({
      cnpj: cnpjLimpo,
      razao_social: dto.razaoSocial,
      nome_fantasia: dto.nomeFantasia,
      esfera: dto.esfera,
      endereco: dto.endereco as Record<string, any>,
      telefone: dto.telefone,
      email: dto.email,
      logo_url: dto.logoUrl,
      ativo: dto.ativo,
    });

    const salvo = await this.orgaoRepository.save(orgao);
    this.logger.log(`Orgao criado: ${salvo.id}`);

    return salvo;
  }

  async listar(query: QueryOrgaoDto) {
    const { pagina = 1, limite = 10, cnpj, razaoSocial, esfera, ativo } = query;

    const qb = this.orgaoRepository.createQueryBuilder('orgao');

    if (cnpj) {
      qb.andWhere('orgao.cnpj LIKE :cnpj', { cnpj: `%${cnpj.replace(/\D/g, '')}%` });
    }
    if (razaoSocial) {
      qb.andWhere('orgao.razao_social ILIKE :razao_social', {
        razao_social: `%${razaoSocial}%`,
      });
    }
    if (esfera) {
      qb.andWhere('orgao.esfera = :esfera', { esfera });
    }
    if (ativo !== undefined) {
      qb.andWhere('orgao.ativo = :ativo', { ativo: ativo === 'true' });
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((pagina - 1) * limite)
      .take(limite)
      .orderBy('orgao.created_at', 'DESC')
      .getMany();

    return {
      items,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  async buscarPorId(id: string): Promise<Orgao> {
    const orgao = await this.orgaoRepository.findOne({ where: { id } });
    if (!orgao) {
      throw new NotFoundException('Orgao nao encontrado');
    }
    return orgao;
  }

  async atualizar(id: string, dto: UpdateOrgaoDto): Promise<Orgao> {
    const orgao = await this.buscarPorId(id);

    if (dto.cnpj) {
      const cnpjLimpo = dto.cnpj.replace(/\D/g, '');
      const existente = await this.orgaoRepository.findOne({
        where: { cnpj: cnpjLimpo },
        withDeleted: true,
      });
      if (existente && existente.id !== id) {
        throw new ConflictException('CNPJ ja cadastrado por outro orgao');
      }
      dto.cnpj = cnpjLimpo;
    }

    if (dto.razaoSocial !== undefined) orgao.razao_social = dto.razaoSocial;
    if (dto.nomeFantasia !== undefined) orgao.nome_fantasia = dto.nomeFantasia;
    if (dto.esfera !== undefined) orgao.esfera = dto.esfera;
    if (dto.endereco !== undefined) orgao.endereco = dto.endereco as Record<string, any>;
    if (dto.telefone !== undefined) orgao.telefone = dto.telefone;
    if (dto.email !== undefined) orgao.email = dto.email;
    if (dto.logoUrl !== undefined) orgao.logo_url = dto.logoUrl;
    if (dto.ativo !== undefined) orgao.ativo = dto.ativo;
    if (dto.cnpj !== undefined) orgao.cnpj = dto.cnpj;

    return this.orgaoRepository.save(orgao);
  }

  async remover(id: string): Promise<void> {
    const orgao = await this.buscarPorId(id);
    await this.orgaoRepository.softRemove(orgao);
    this.logger.log(`Orgao removido (soft delete): ${id}`);
  }
}
