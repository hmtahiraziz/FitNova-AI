import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';

export type AuthUser = {
  userId: string;
  email: string;
  sessionId: string;
};

export type AuthedRequest = Request & {
  user?: AuthUser;
};

export const ACCESS_EXPIRES_IN = '15m';
export const JWT_ISSUER = 'fitnova-api';
export const JWT_AUDIENCE = 'fitnova-mobile';

const jwtSignOptions: jwt.SignOptions = {
  algorithm: 'HS256',
  expiresIn: ACCESS_EXPIRES_IN,
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

const jwtVerifyOptions: jwt.VerifyOptions = {
  algorithms: ['HS256'],
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

export function signAccessToken(payload: AuthUser): string {
  return jwt.sign(payload, env.JWT_SECRET, jwtSignOptions);
}

export async function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Unauthorized', 401));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET,
      jwtVerifyOptions,
    ) as AuthUser;
    if (!decoded.userId || !decoded.sessionId) {
      next(new AppError('Invalid or expired token', 401));
      return;
    }

    const session = await prisma.userSession.findFirst({
      where: { id: decoded.sessionId, userId: decoded.userId },
      select: { id: true, expiresAt: true },
    });

    if (!session) {
      next(new AppError('Invalid or expired token', 401));
      return;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await prisma.userSession.deleteMany({ where: { id: session.id } });
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
