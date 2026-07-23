import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import { planGenerateBodySchema } from '../schemas/plans.generate.schemas';
import {
  generatePlan,
  getLatestPlanPayload,
  listPlans,
} from '../services/plan.service';

export const plansRouter = Router();

plansRouter.use(requireAuth);

plansRouter.post('/generate', async (req: AuthedRequest, res, next) => {
  try {
    const body = planGenerateBodySchema.parse(req.body ?? {});
    const result = await generatePlan(req.user!.userId, body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

plansRouter.get('/latest', async (req: AuthedRequest, res, next) => {
  try {
    const payload = await getLatestPlanPayload(req.user!.userId);
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

plansRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const plans = await listPlans(req.user!.userId);
    res.json({ plans });
  } catch (err) {
    next(err);
  }
});
