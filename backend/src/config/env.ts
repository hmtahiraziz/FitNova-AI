import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('*'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_WEB_CLIENT_ID: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z
    .string()
    .optional()
    .default('FitNova AI <noreply@example.com>'),
  APP_URL: z.string().optional().default('http://localhost:4000'),
  /** Absolute path for uploads (mount a Railway volume here in production). */
  UPLOADS_DIR: z.string().optional().default(''),
  SUPPORT_EMAIL: z.string().optional().default('support@example.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;

if (env.NODE_ENV === 'production' && env.CORS_ORIGIN === '*') {
  console.warn(
    '[fitnova] CORS_ORIGIN is "*" in production. Prefer locking to known origins if you add a web client.',
  );
}

if (env.NODE_ENV === 'production' && !env.UPLOADS_DIR) {
  console.warn(
    '[fitnova] UPLOADS_DIR is unset. Profile photos will be lost on redeploy unless you mount a Railway volume.',
  );
}

export function googleAudiences(): string[] {
  return [env.GOOGLE_WEB_CLIENT_ID, env.GOOGLE_CLIENT_ID].filter(Boolean);
}

export function uploadsRoot(): string {
  if (env.UPLOADS_DIR.trim()) {
    return path.resolve(env.UPLOADS_DIR.trim());
  }
  return path.join(process.cwd(), 'uploads');
}
