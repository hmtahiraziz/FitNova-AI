import { Router } from 'express';
import { SERVICE_NAME } from '../content/legal';
import { prisma } from '../lib/prisma';

export const healthRouter = Router();

/** Liveness — process is up (Railway healthcheck). */
healthRouter.get('/', async (_req, res) => {
  let database: 'up' | 'down' = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'up';
  } catch {
    database = 'down';
  }

  const ok = database === 'up';
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    service: SERVICE_NAME,
    database,
    timestamp: new Date().toISOString(),
  });
});

/** Explicit readiness probe (same checks; useful for ops). */
healthRouter.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: SERVICE_NAME,
      database: 'up',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      service: SERVICE_NAME,
      database: 'down',
      timestamp: new Date().toISOString(),
    });
  }
});
