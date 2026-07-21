import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from './entities/auditoria.entity';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let repo: jest.Mocked<Partial<Repository<Auditoria>>>;

  const mockAuditoria: Auditoria = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    usuario_id: '660e8400-e29b-41d4-a716-446655440001',
    orgao_id: '770e8400-e29b-41d4-a716-446655440002',
    acao: 'criar',
    recurso: 'usuario',
    recurso_id: '880e8400-e29b-41d4-a716-446655440003',
    dados_antes: null,
    dados_depois: { nome: 'Joao', email: 'joao@test.com' },
    ip: '192.168.1.1',
    user_agent: 'jest-test',
    created_at: new Date('2026-07-21T01:00:00Z'),
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        {
          provide: getRepositoryToken(Auditoria),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<AuditoriaService>(AuditoriaService);
  });

  describe('criar', () => {
    it('deve criar um registro de auditoria com sucesso', async () => {
      const input = {
        usuario_id: '660e8400-e29b-41d4-a716-446655440001',
        orgao_id: '770e8400-e29b-41d4-a716-446655440002',
        acao: 'criar',
        recurso: 'usuario',
        dados_depois: { nome: 'Joao' },
        ip: '192.168.1.1',
        user_agent: 'jest-test',
      };

      repo.create.mockReturnValue(mockAuditoria);
      repo.save.mockResolvedValue(mockAuditoria);

      const result = await service.criar(input);

      expect(repo.create).toHaveBeenCalledWith(input);
      expect(repo.save).toHaveBeenCalledWith(mockAuditoria);
      expect(result).toEqual(mockAuditoria);
      expect(result.id).toBeDefined();
    });

    it('deve criar registro sem usuario para operacoes anonimas', async () => {
      const input = {
        acao: 'login_falho',
        recurso: 'auth',
        ip: '10.0.0.1',
        user_agent: 'curl',
      };

      const anonAuditoria = {
        ...mockAuditoria,
        usuario_id: null,
        orgao_id: null,
        acao: 'login_falho',
      };
      repo.create.mockReturnValue(anonAuditoria);
      repo.save.mockResolvedValue(anonAuditoria);

      const result = await service.criar(input);

      expect(repo.create).toHaveBeenCalledWith(input);
      expect(result.usuario_id).toBeNull();
      expect(result.acao).toBe('login_falho');
    });

    it('deve preservar dados_antes e dados_depois como JSONB', async () => {
      const dadosAntes = { nome: 'Joao Velho', email: 'joao.old@test.com' };
      const dadosDepois = { nome: 'Joao Novo', email: 'joao.new@test.com' };

      const input = {
        acao: 'atualizar',
        recurso: 'usuario',
        dados_antes: dadosAntes,
        dados_depois: dadosDepois,
      };

      const expected = { ...mockAuditoria, ...input };
      repo.create.mockReturnValue(expected);
      repo.save.mockResolvedValue(expected);

      const result = await service.criar(input);

      expect(result.dados_antes).toEqual(dadosAntes);
      expect(result.dados_depois).toEqual(dadosDepois);
    });
  });

  describe('listar', () => {
    const registros: Auditoria[] = [
      mockAuditoria,
      { ...mockAuditoria, id: '990e8400-e29b-41d4-a716-446655440004', acao: 'atualizar' },
    ];

    it('deve listar todos os registros com paginacao', async () => {
      repo.findAndCount.mockResolvedValue([registros, 2]);

      const result = await service.listar({ pagina: 1, limite: 20 });

      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { created_at: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pagina).toBe(1);
      expect(result.limite).toBe(20);
      expect(result.total_paginas).toBe(1);
    });

    it('deve filtrar por usuario_id', async () => {
      repo.findAndCount.mockResolvedValue([[mockAuditoria], 1]);

      const result = await service.listar({
        usuario_id: '660e8400-e29b-41d4-a716-446655440001',
        pagina: 1,
        limite: 20,
      });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usuario_id: '660e8400-e29b-41d4-a716-446655440001',
          }),
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('deve filtrar por orgao_id', async () => {
      repo.findAndCount.mockResolvedValue([[mockAuditoria], 1]);

      const result = await service.listar({
        orgao_id: '770e8400-e29b-41d4-a716-446655440002',
        pagina: 1,
        limite: 20,
      });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orgao_id: '770e8400-e29b-41d4-a716-446655440002',
          }),
        }),
      );
    });

    it('deve filtrar por recurso', async () => {
      repo.findAndCount.mockResolvedValue([[mockAuditoria], 1]);

      await service.listar({ recurso: 'usuario', pagina: 1, limite: 20 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ recurso: 'usuario' }),
        }),
      );
    });

    it('deve filtrar por acao', async () => {
      repo.findAndCount.mockResolvedValue([[mockAuditoria], 1]);

      await service.listar({ acao: 'criar', pagina: 1, limite: 20 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ acao: 'criar' }),
        }),
      );
    });

    it('deve filtrar por periodo (data_inicio e data_fim)', async () => {
      repo.findAndCount.mockResolvedValue([[mockAuditoria], 1]);

      await service.listar({
        data_inicio: '2026-07-01',
        data_fim: '2026-07-31',
        pagina: 1,
        limite: 20,
      });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            created_at: expect.any(Object),
          }),
        }),
      );
    });

    it('deve aplicar paginacao corretamente', async () => {
      repo.findAndCount.mockResolvedValue([[mockAuditoria], 1]);

      const result = await service.listar({ pagina: 2, limite: 10 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.pagina).toBe(2);
      expect(result.limite).toBe(10);
    });

    it('deve retornar lista vazia quando nao houver registros', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.listar({ pagina: 1, limite: 20 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.total_paginas).toBe(0);
    });

    it('deve combinar multiplos filtros simultaneamente', async () => {
      repo.findAndCount.mockResolvedValue([[mockAuditoria], 1]);

      await service.listar({
        usuario_id: '660e8400-e29b-41d4-a716-446655440001',
        orgao_id: '770e8400-e29b-41d4-a716-446655440002',
        recurso: 'usuario',
        acao: 'criar',
        pagina: 1,
        limite: 20,
      });

      const where = (repo.findAndCount as jest.Mock).mock.calls[0][0].where;
      expect(where.usuario_id).toBe('660e8400-e29b-41d4-a716-446655440001');
      expect(where.orgao_id).toBe('770e8400-e29b-41d4-a716-446655440002');
      expect(where.recurso).toBe('usuario');
      expect(where.acao).toBe('criar');
    });
  });
});
