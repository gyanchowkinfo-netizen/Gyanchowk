import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env, isProd } from './config/env.js';
import { api } from './routes/index.js';
import { webhookRouter } from './routes/payment.routes.js';
import { errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(
    '/api/webhooks',
    express.raw({ type: 'application/json' }),
    (req, _res, next) => {
      (req as express.Request & { rawBody?: string }).rawBody = (req.body as Buffer).toString('utf8');
      try {
        req.body = JSON.parse((req as express.Request & { rawBody: string }).rawBody);
      } catch {
        req.body = {};
      }
      next();
    },
    webhookRouter,
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan(isProd ? 'combined' : 'dev'));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 400,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(
    '/api/auth/login',
    rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { error: 'Too many login attempts' } }),
  );
  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'gyan-chowk' }));
  app.use('/api', api);
  app.use(errorHandler);
  return app;
}
