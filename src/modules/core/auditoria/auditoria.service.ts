import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { FiltrarAuditoriaDto } from './dto/filtrar-auditoria.dto';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepo: Repository<Auditoria>,
  ) {}

  async criar(data: Partial<Auditoria>): Promise<Auditoria> {
    const registro = this.auditoriaRepo.create(data);
    return this.auditoriaRepo.save(registro);
  }

  async listar(filtros: FiltrarAuditoriaDto) {
    const where: any = {};
    const {
      usuario_id,
      orgao_id,
      recurso,
      acao,
      data_inicio,
      data_fim,
      pagina,
      limite,
    } = filtros;

    if (usuario_id) where.usuario_id = usuario_id;
    if (orgao_id) where.orgao_id = orgao_id;
    if (recurso) where.recurso = recurso;
    if (acao) where.acao = acao;
    if (data_inicio && data_fim) {
      where.created_at = Between(
        new Date(data_inicio),
        new Date(data_fim),
      );
    }

    const [data, total] = await this.auditoriaRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (pagina! - 1) * limite!,
      take: limite!,
    });

    return {
      data,
      total,
      pagina,
      limite,
      total_paginas: Math.ceil(total / limite!),
    };
  }
}
