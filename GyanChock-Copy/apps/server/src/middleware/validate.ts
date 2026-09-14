import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);
    (req as Request & { validated: unknown }).validated = parsed;
    if (source === 'query') {
      Object.assign(req.query, parsed);
    } else {
      req[source] = parsed as typeof req.body;
    }
    next();
  };
}
