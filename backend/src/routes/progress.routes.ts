import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import {
  progressRangeQuerySchema,
  progressStatsQuerySchema,
  upsertProgressSchema,
} from '../schemas/progress.schemas';
import {
  getProgressStats,
  listProgress,
  upsertProgress,
} from '../services/progress.service';

export const progressRouter = Router();

progressRouter.use(requireAuth);

progressRouter.put('/', async (req: AuthedRequest, res, next) => {
  try {
    const body = upsertProgressSchema.parse(req.body);
    const log = await upsertProgress(req.user!.userId, body);
    res.json({ log });
  } catch (err) {
    next(err);
  }
});

progressRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const query = progressRangeQuerySchema.parse(req.query);
    const result = await listProgress(req.user!.userId, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

progressRouter.get('/stats', async (req: AuthedRequest, res, next) => {
  try {
    const query = progressStatsQuerySchema.parse(req.query);
    const stats = await getProgressStats(req.user!.userId, query);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});
