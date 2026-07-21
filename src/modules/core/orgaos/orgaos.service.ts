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

  async criar(dto: CreateOrgaoDto, _tenantId?: string): Promise<Orgao> {
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

  async listar(query: QueryOrgaoDto, tenantId?: string) {
    const { pagina = 1, limite = 10, cnpj, razaoSocial, esfera, ativo } = query;

    const qb = this.orgaoRepository.createQueryBuilder('orgao');

    if (tenantId) {
      qb.andWhere('orgao.tenantId = :tenantId', { tenantId });
    }

    if (cnpj) {
      qb.andWhere('orgao.cnpj LIKE :cnpj', { cnpj: `%${cnpj.replace(/\D/g, '')}%` });
    }
    if (razaoSocial) {
      qb.andWhere('orgao.razaoSocial ILIKE :razaoSocial', {
        razaoSocial: `%${razaoSocial}%`,
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
      .orderBy('orgao.createdAt', 'DESC')
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

  async buscarPorId(id: string, tenantId?: string): Promise<Orgao> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    const orgao = await this.orgaoRepository.findOne({ where });
    if (!orgao) {
      throw new NotFoundException('Orgao nao encontrado');
    }
    return orgao;
  }

  async atualizar(id: string, dto: UpdateOrgaoDto, tenantId?: string): Promise<Orgao> {
    const orgao = await this.buscarPorId(id, tenantId);

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

    Object.assign(orgao, dto);
    return this.orgaoRepository.save(orgao);
  }

  async remover(id: string, tenantId?: string): Promise<void> {
    const orgao = await this.buscarPorId(id, tenantId);
    await this.orgaoRepository.softRemove(orgao);
    this.logger.log(`Orgao removido (soft delete): ${id}`);
  }
}
