import { SetMetadata } from '@nestjs/common';
import { AUDIT_METADATA_KEY } from '../interceptors/audit.interceptor';

export interface AuditOptions {
  acao: string;
  recurso: string;
}

export const Audit = (options: AuditOptions) =>
  SetMetadata(AUDIT_METADATA_KEY, options);
