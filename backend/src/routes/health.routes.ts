import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'b4-fitness-api',
    timestamp: new Date().toISOString(),
  });
});
