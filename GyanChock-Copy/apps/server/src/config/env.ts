import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  path.resolve(here, '../../../../.env'),
  path.resolve(here, '../../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];
for (const envPath of envCandidates) {
  dotenv.config({ path: envPath });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  CLIENT_ORIGIN: z.string().default('https://gyanchowk.vercel.app,http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().default('https://gyanchowk.vercel.app'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_URL: z.string().optional().default(''),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  PLATFORM_COMMISSION_PERCENT: z.coerce.number().min(0).max(90).default(20),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('Gyan Chowk <noreply@gyanchowk.com>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success && process.env.NODE_ENV !== 'test') {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration. Copy .env.example to .env and fill values.');
}

export const env =
  parsed.success
    ? parsed.data
    : envSchema.parse({
        MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/gyan-chowk-test',
        JWT_SECRET: process.env.JWT_SECRET ?? 'test-jwt-secret-value-xx',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-xx',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? 'admin@test.local',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'TestAdmin!234',
        NODE_ENV: 'test',
      });

export const isProd = env.NODE_ENV === 'production';
