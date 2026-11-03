import multer from 'multer';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import { upsertProfileSchema } from '../schemas/profile.schemas';
import {
  clearProfileAvatar,
  readProfileAvatar,
  setProfileAvatar,
} from '../services/avatar.service';
import { getProfile, upsertProfile } from '../services/profile.service';
import { AppError } from '../middleware/errorHandler';

export const profileRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const avatarUploadLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = (req as AuthedRequest).user?.userId;
    if (userId) {
      return `avatar:${userId}`;
    }
    // Fallback (should not hit after requireAuth); use helper for IPv6 safety.
    return `avatar-ip:${ipKeyGenerator(req.ip ?? '127.0.0.1')}`;
  },
  message: { error: 'Too many photo uploads. Try again later.' },
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

profileRouter.get('/avatar', async (req: AuthedRequest, res, next) => {
  try {
    const avatar = await readProfileAvatar(req.user!.userId);
    if (!avatar) {
      throw new AppError('No profile photo', 404);
    }
    res.setHeader('Content-Type', avatar.contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline; filename="avatar.jpg"');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.status(200).send(avatar.buffer);
  } catch (err) {
    next(err);
  }
});

profileRouter.post(
  '/avatar',
  avatarUploadLimit,
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
