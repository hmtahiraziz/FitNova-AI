import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  forgotPasswordSchema,
  googleAuthSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  deleteAccountSchema,
} from '../schemas/auth.schemas';
import {
  deleteUserAccount,
  getMe,
  loginUser,
  loginWithGoogle,
  logoutUser,
  refreshSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from '../services/auth.service';
import { requireAuth, type AuthedRequest } from '../middleware/auth';

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again later.' },
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Try again later.' },
});

export const authRouter = Router();

authRouter.use(authRateLimit);

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerUser(body.email, body.password, {
      deviceId: body.deviceId,
      deviceName: body.deviceName,
      platform: body.platform,
      appVersion: body.appVersion,
      ipAddress: req.ip,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', loginRateLimit, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body.email, body.password, {
      deviceId: body.deviceId,
      deviceName: body.deviceName,
      platform: body.platform,
      appVersion: body.appVersion,
      ipAddress: req.ip,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/google', loginRateLimit, async (req, res, next) => {
  try {
    const body = googleAuthSchema.parse(req.body);
    const result = await loginWithGoogle(body.idToken, {
      deviceId: body.deviceId,
      deviceName: body.deviceName,
      platform: body.platform,
      appVersion: body.appVersion,
      ipAddress: req.ip,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const body = refreshSchema.parse(req.body);
    const result = await refreshSession(body.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const body = logoutSchema.parse(req.body ?? {});
    await logoutUser(body.refreshToken);
    res.json({ message: 'Signed out' });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const result = await requestPasswordReset(body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(
      body.email,
      body.code,
      body.newPassword,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await getMe(req.user!.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

authRouter.delete('/account', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = deleteAccountSchema.parse(req.body ?? {});
    const result = await deleteUserAccount(req.user!.userId, body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
