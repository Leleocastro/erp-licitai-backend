import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { AuditoriaService } from '../../modules/core/auditoria/auditoria.service';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditoriaService: { criar: jest.Mock };
  let reflector: { get: jest.Mock };

  const mockRequest = (method: string, overrides: any = {}) => ({
    method,
    user: { id: 'user-id-1', orgao_id: 'orgao-id-1' },
    headers: {
      'x-forwarded-for': '192.168.1.100',
      'user-agent': 'jest-test',
    },
    ip: '10.0.0.1',
    params: {},
    body: { nome: 'Joao' },
    ...overrides,
  });

  const mockExecutionContext = (request: any) => ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => () => {},
  }) as any;

  beforeEach(async () => {
    auditoriaService = {
      criar: jest.fn().mockResolvedValue({ id: 'audit-id' }),
    };
    reflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: Reflector,
          useValue: reflector,
        },
        {
          provide: AuditoriaService,
          useValue: auditoriaService,
        },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
  });

  describe('intercept', () => {
    it('deve ignorar requisicoes GET', (done) => {
      const request = mockRequest('GET');
      const context = mockExecutionContext(request);
      const next = { handle: () => of({ success: true }) };

      interceptor.intercept(context, next).subscribe({
        next: (result) => {
          expect(result).toEqual({ success: true });
          expect(auditoriaService.criar).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('deve ignorar requisicoes sem metadata de auditoria', (done) => {
      const request = mockRequest('POST');
      const context = mockExecutionContext(request);
      const next = { handle: () => of({ success: true }) };

      reflector.get.mockReturnValue(undefined);

      interceptor.intercept(context, next).subscribe({
        next: (result) => {
          expect(result).toEqual({ success: true });
          expect(auditoriaService.criar).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('deve registrar auditoria em POST com metadata', (done) => {
      const request = mockRequest('POST');
      const context = mockExecutionContext(request);
      const next = { handle: () => of({ success: true }) };

      reflector.get.mockReturnValue({ acao: 'criar', recurso: 'usuario' });

      interceptor.intercept(context, next).subscribe({
        next: () => {
          expect(auditoriaService.criar).toHaveBeenCalledWith(
            expect.objectContaining({
              usuario_id: 'user-id-1',
              orgao_id: 'orgao-id-1',
              acao: 'criar',
              recurso: 'usuario',
              ip: '192.168.1.100',
              user_agent: 'jest-test',
            }),
          );
          done();
        },
      });
    });

    it('deve registrar auditoria em PUT', (done) => {
      const request = mockRequest('PUT', { params: { id: 'resource-id' } });
      const context = mockExecutionContext(request);
      const next = { handle: () => of({ updated: true }) };

      reflector.get.mockReturnValue({ acao: 'atualizar', recurso: 'usuario' });

      interceptor.intercept(context, next).subscribe({
        next: () => {
          expect(auditoriaService.criar).toHaveBeenCalledWith(
            expect.objectContaining({
              acao: 'atualizar',
              recurso_id: 'resource-id',
            }),
          );
          done();
        },
      });
    });

    it('deve registrar auditoria em DELETE', (done) => {
      const request = mockRequest('DELETE', { params: { id: 'resource-id' } });
      const context = mockExecutionContext(request);
      const next = { handle: () => of({ deleted: true }) };

      reflector.get.mockReturnValue({ acao: 'deletar', recurso: 'usuario' });

      interceptor.intercept(context, next).subscribe({
        next: () => {
          expect(auditoriaService.criar).toHaveBeenCalledWith(
            expect.objectContaining({
              acao: 'deletar',
              recurso_id: 'resource-id',
              dados_depois: { nome: 'Joao' },
            }),
          );
          done();
        },
      });
    });

    it('deve registrar auditoria mesmo quando a requisicao falha', (done) => {
      const request = mockRequest('POST');
      const context = mockExecutionContext(request);
      const error = new Error('Internal Server Error');
      const next = { handle: () => throwError(() => error) };

      reflector.get.mockReturnValue({ acao: 'criar', recurso: 'usuario' });

      interceptor.intercept(context, next).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(auditoriaService.criar).toHaveBeenCalledWith(
            expect.objectContaining({
              acao: 'criar',
              dados_depois: null,
            }),
          );
          done();
        },
      });
    });

    it('deve registrar dados_antes corretamente', (done) => {
      const request = mockRequest('PUT', {
        params: { id: 'resource-id' },
        body: { nome: 'Joao Novo' },
      });
      const context = mockExecutionContext(request);
      const next = { handle: () => of({ updated: true }) };

      reflector.get.mockReturnValue({ acao: 'atualizar', recurso: 'usuario' });

      interceptor.intercept(context, next).subscribe({
        next: () => {
          expect(auditoriaService.criar).toHaveBeenCalledWith(
            expect.objectContaining({
              dados_antes: { nome: 'Joao Novo' },
            }),
          );
          done();
        },
      });
    });

    it('deve extrair IP do x-forwarded-for', (done) => {
      const request = mockRequest('POST', {
        headers: {
          'x-forwarded-for': '200.200.200.1, 10.0.0.1',
          'user-agent': 'mocha',
        },
      });
      const context = mockExecutionContext(request);
      const next = { handle: () => of({ success: true }) };

      reflector.get.mockReturnValue({ acao: 'criar', recurso: 'teste' });

      interceptor.intercept(context, next).subscribe({
        next: () => {
          expect(auditoriaService.criar).toHaveBeenCalledWith(
            expect.objectContaining({ ip: '200.200.200.1' }),
          );
          done();
        },
      });
    });

    it('deve funcionar sem usuario logado', (done) => {
      const request = mockRequest('POST', { user: undefined });
      const context = mockExecutionContext(request);
      const next = { handle: () => of({ success: true }) };

      reflector.get.mockReturnValue({ acao: 'criar', recurso: 'usuario' });

      interceptor.intercept(context, next).subscribe({
        next: () => {
          expect(auditoriaService.criar).toHaveBeenCalledWith(
            expect.objectContaining({
              usuario_id: undefined,
              orgao_id: undefined,
            }),
          );
          done();
        },
      });
    });
  });
});
