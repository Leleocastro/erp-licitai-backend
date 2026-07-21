import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permissao } from '../permissoes/entities/permissao.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { LinkPermissoesDto } from './dto/link-permissoes.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permissao)
    private permissaoRepository: Repository<Permissao>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOne({
      where: { nome: dto.nome },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Role "${dto.nome}" ja existe`);
    }

    if (dto.role_pai_id) {
      const pai = await this.roleRepository.findOne({
        where: { id: dto.role_pai_id },
      });
      if (!pai) {
        throw new BadRequestException('Role pai nao encontrada');
      }
    }

    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async findAll(orgao_id?: string): Promise<Role[]> {
    const where: any = {};
    if (orgao_id) {
      where.orgao_id = orgao_id;
    }
    return this.roleRepository.find({
      where,
      relations: ['permissoes', 'role_pai'],
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissoes', 'role_pai'],
    });

    if (!role) {
      throw new NotFoundException('Role nao encontrada');
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (dto.nome && dto.nome !== role.nome) {
      const existing = await this.roleRepository.findOne({
        where: { nome: dto.nome },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Role "${dto.nome}" ja existe`);
      }
    }

    if (dto.role_pai_id) {
      if (dto.role_pai_id === id) {
        throw new BadRequestException('Uma role nao pode ser pai dela mesma');
      }

      const pai = await this.roleRepository.findOne({
        where: { id: dto.role_pai_id },
      });
      if (!pai) {
        throw new BadRequestException('Role pai nao encontrada');
      }
    }

    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.sistema) {
      throw new BadRequestException('Roles de sistema nao podem ser removidas');
    }

    await this.roleRepository.softDelete(id);
  }

  async linkPermissoes(id: string, dto: LinkPermissoesDto): Promise<Role> {
    const role = await this.findOne(id);

    const permissoes = await this.permissaoRepository.findByIds(
      dto.permissao_ids,
    );

    if (permissoes.length !== dto.permissao_ids.length) {
      throw new NotFoundException(
        'Uma ou mais permissoes nao foram encontradas',
      );
    }

    role.permissoes = permissoes;
    return this.roleRepository.save(role);
  }

  async getPermissoes(id: string): Promise<Permissao[]> {
    const role = await this.findOne(id);

    const permissionSet = new Map<string, Permissao>();

    const collectPermissoes = async (roleId: string) => {
      const currentRole = await this.roleRepository.findOne({
        where: { id: roleId },
        relations: ['permissoes'],
      });

      if (!currentRole) return;

      if (currentRole.permissoes) {
        for (const perm of currentRole.permissoes) {
          permissionSet.set(perm.id, perm);
        }
      }

      if (currentRole.role_pai_id) {
        await collectPermissoes(currentRole.role_pai_id);
      }
    };

    await collectPermissoes(role.id);

    return Array.from(permissionSet.values());
  }
}
