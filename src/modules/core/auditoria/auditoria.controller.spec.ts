import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';

describe('AuditoriaController', () => {
  let controller: AuditoriaController;
  let service: { listar: jest.Mock };

  const mockResult = {
    data: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        usuario_id: '660e8400-e29b-41d4-a716-446655440001',
        orgao_id: null,
        acao: 'criar',
        recurso: 'usuario',
        recurso_id: null,
        dados_antes: null,
        dados_depois: { nome: 'Joao' },
        ip: '192.168.1.1',
        user_agent: 'jest',
        created_at: new Date('2026-07-21T01:00:00Z'),
      },
    ],
    total: 1,
    pagina: 1,
    limite: 20,
    total_paginas: 1,
  };

  beforeEach(async () => {
    service = {
      listar: jest.fn().mockResolvedValue(mockResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaController],
      providers: [
        {
          provide: AuditoriaService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AuditoriaController>(AuditoriaController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/core/auditoria', () => {
    it('deve listar registros sem filtros', async () => {
      const result = await controller.listar({
        pagina: 1,
        limite: 20,
      });

      expect(service.listar).toHaveBeenCalledWith({
        pagina: 1,
        limite: 20,
      });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('deve listar registros com filtro de usuario', async () => {
      const result = await controller.listar({
        usuario_id: '660e8400-e29b-41d4-a716-446655440001',
        pagina: 1,
        limite: 20,
      });

      expect(service.listar).toHaveBeenCalledWith({
        usuario_id: '660e8400-e29b-41d4-a716-446655440001',
        pagina: 1,
        limite: 20,
      });
      expect(result).toBeDefined();
    });

    it('deve listar registros com filtro de orgao', async () => {
      await controller.listar({
        orgao_id: '770e8400-e29b-41d4-a716-446655440002',
        pagina: 1,
        limite: 20,
      });

      expect(service.listar).toHaveBeenCalledWith({
        orgao_id: '770e8400-e29b-41d4-a716-446655440002',
        pagina: 1,
        limite: 20,
      });
    });

    it('deve listar registros com filtro de recurso', async () => {
      await controller.listar({
        recurso: 'usuario',
        pagina: 1,
        limite: 20,
      });

      expect(service.listar).toHaveBeenCalledWith({
        recurso: 'usuario',
        pagina: 1,
        limite: 20,
      });
    });

    it('deve listar registros com filtro de acao', async () => {
      await controller.listar({
        acao: 'criar',
        pagina: 1,
        limite: 20,
      });

      expect(service.listar).toHaveBeenCalledWith({
        acao: 'criar',
        pagina: 1,
        limite: 20,
      });
    });

    it('deve listar registros com filtro de periodo', async () => {
      await controller.listar({
        data_inicio: '2026-07-01',
        data_fim: '2026-07-31',
        pagina: 1,
        limite: 20,
      });

      expect(service.listar).toHaveBeenCalledWith({
        data_inicio: '2026-07-01',
        data_fim: '2026-07-31',
        pagina: 1,
        limite: 20,
      });
    });

    it('deve retornar paginacao correta', async () => {
      const result = await controller.listar({
        pagina: 2,
        limite: 10,
      });

      expect(result.pagina).toBe(1);
      expect(result.limite).toBe(20);
    });

    it('deve retornar formato esperado da resposta', async () => {
      const result = await controller.listar({
        pagina: 1,
        limite: 20,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pagina');
      expect(result).toHaveProperty('limite');
      expect(result).toHaveProperty('total_paginas');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
