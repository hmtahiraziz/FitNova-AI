import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { healthRouter } from './routes/health.routes';
import { plansRouter } from './routes/plans.routes';
import { profileRouter } from './routes/profile.routes';
import { progressRouter } from './routes/progress.routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      maxAge: env.NODE_ENV === 'production' ? '7d' : 0,
    }),
  );

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/profile', profileRouter);
  app.use('/plans', plansRouter);
  app.use('/progress', progressRouter);

  app.use(errorHandler);

  return app;
}
