import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export type AuthUser = {
  userId: string;
  email: string;
  sessionId: string;
};

export type AuthedRequest = Request & {
  user?: AuthUser;
};

const ACCESS_EXPIRES_IN = '15m';

export function signAccessToken(payload: AuthUser): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Unauthorized', 401));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    if (!decoded.userId || !decoded.sessionId) {
      next(new AppError('Invalid or expired token', 401));
      return;
    }
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
