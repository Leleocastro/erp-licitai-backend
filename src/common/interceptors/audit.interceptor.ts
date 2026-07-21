import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuditoriaService } from '../../modules/core/auditoria/auditoria.service';

export const AUDIT_METADATA_KEY = 'audit_metadata';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject(forwardRef(() => AuditoriaService))
    private readonly auditoriaService: AuditoriaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const auditMetadata = this.reflector.get<{
      acao: string;
      recurso: string;
    }>(AUDIT_METADATA_KEY, context.getHandler());

    if (!auditMetadata) {
      return next.handle();
    }

    const usuario = request.user;
    const ip =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip;
    const userAgent = request.headers['user-agent'];

    const dadosAntes = { ...request.body };

    return next.handle().pipe(
      tap(() => {
        this.auditoriaService
          .criar({
            usuario_id: usuario?.id,
            orgao_id: usuario?.orgao_id,
            acao: auditMetadata.acao,
            recurso: auditMetadata.recurso,
            recurso_id: request.params?.id,
            dados_antes: dadosAntes,
            dados_depois: request.body,
            ip,
            user_agent: userAgent,
          })
          .catch(() => {});
      }),
      catchError((error) => {
        this.auditoriaService
          .criar({
            usuario_id: usuario?.id,
            orgao_id: usuario?.orgao_id,
            acao: auditMetadata.acao,
            recurso: auditMetadata.recurso,
            recurso_id: request.params?.id,
            dados_antes: dadosAntes,
            dados_depois: null as unknown as Record<string, any>,
            ip,
            user_agent: userAgent,
          })
          .catch(() => {});
        return throwError(() => error);
      }),
    );
  }
}
