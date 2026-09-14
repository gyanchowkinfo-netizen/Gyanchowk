import type { NextFunction, Response } from 'express';
import { AuditLogModel } from '../models/index.js';
import type { AuthedRequest } from './auth.js';

export function audit(action: string, entity: string) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    const originalJson = _res.json.bind(_res);
    _res.json = (body: unknown) => {
      void AuditLogModel.create({
        actor: req.user?.id,
        role: req.user?.role,
        action,
        entity,
        entityId: String(req.params.id ?? (body as { id?: string })?.id ?? ''),
        ip: req.ip,
        userAgent: req.get('user-agent'),
        after: sanitize(body),
      }).catch((err) => console.error('[audit]', err));
      return originalJson(body);
    };
    next();
  };
}

export async function writeAudit(input: {
  actor?: string;
  role?: string;
  action: string;
  entity: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  before?: unknown;
  after?: unknown;
}) {
  const { before, after, ...rest } = input;
  await AuditLogModel.create({
    ...rest,
    before: sanitize(before),
    after: sanitize(after),
  });
}

const SENSITIVE = /password|secret|token|authorization|cookie|signature/i;

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 20).map(sanitize);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE.test(k)) continue;
    out[k] = typeof v === 'object' ? '[object]' : v;
  }
  return out;
}
