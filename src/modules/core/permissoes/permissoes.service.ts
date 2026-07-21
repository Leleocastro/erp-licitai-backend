import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permissao } from './entities/permissao.entity';
import { CreatePermissaoDto } from './dto/create-permissao.dto';

@Injectable()
export class PermissoesService {
  constructor(
    @InjectRepository(Permissao)
    private permissaoRepository: Repository<Permissao>,
  ) {}

  async create(dto: CreatePermissaoDto): Promise<Permissao> {
    const slug = `${dto.recurso}:${dto.acao}`;

    const existing = await this.permissaoRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Permissao "${slug}" ja existe`);
    }

    const permissao = this.permissaoRepository.create({
      ...dto,
      slug,
    });

    return this.permissaoRepository.save(permissao);
  }

  async findAll(modulo?: string): Promise<Permissao[]> {
    const where: any = {};
    if (modulo) {
      where.modulo = modulo;
    }
    return this.permissaoRepository.find({
      where,
      order: { recurso: 'ASC', acao: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Permissao> {
    const permissao = await this.permissaoRepository.findOne({
      where: { id },
    });

    if (!permissao) {
      throw new NotFoundException('Permissao nao encontrada');
    }

    return permissao;
  }

  async findOrCreate(dto: CreatePermissaoDto): Promise<Permissao> {
    const slug = `${dto.recurso}:${dto.acao}`;

    const existing = await this.permissaoRepository.findOne({
      where: { slug },
    });

    if (existing) return existing;

    return this.create(dto);
  }
}
