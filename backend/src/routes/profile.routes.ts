import multer from 'multer';
import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import { upsertProfileSchema } from '../schemas/profile.schemas';
import {
  clearProfileAvatar,
  setProfileAvatar,
} from '../services/avatar.service';
import { getProfile, upsertProfile } from '../services/profile.service';
import { AppError } from '../middleware/errorHandler';

export const profileRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

profileRouter.use(requireAuth);

profileRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const profile = await getProfile(req.user!.userId);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

profileRouter.put('/', async (req: AuthedRequest, res, next) => {
  try {
    const body = upsertProfileSchema.parse(req.body);
    const profile = await upsertProfile(req.user!.userId, body);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

profileRouter.post(
  '/avatar',
  upload.single('avatar'),
  async (req: AuthedRequest, res, next) => {
    try {
      if (!req.file) {
        throw new AppError('Choose a photo to upload', 400);
      }
      await setProfileAvatar(req.user!.userId, req.file);
      const profile = await getProfile(req.user!.userId);
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  },
);

profileRouter.delete('/avatar', async (req: AuthedRequest, res, next) => {
  try {
    await clearProfileAvatar(req.user!.userId);
    const profile = await getProfile(req.user!.userId);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});
