import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import {
  generateRefreshToken,
  hashRefreshToken,
  type SessionClientInfo,
} from '../utils/refreshToken';

/** Sliding refresh lifetime: each successful refresh extends by this duration. */
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function refreshExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + REFRESH_TTL_MS);
}

export async function createUserSession(
  userId: string,
  client: SessionClientInfo = {},
): Promise<{ sessionId: string; refreshToken: string }> {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await prisma.userSession.create({
    data: {
      userId,
      refreshTokenHash,
      previousRefreshTokenHash: null,
      expiresAt: refreshExpiresAt(),
      deviceId: client.deviceId ?? null,
      deviceName: client.deviceName ?? null,
      platform: client.platform ?? null,
      appVersion: client.appVersion ?? null,
      ipAddress: client.ipAddress ?? null,
    },
  });

  return { sessionId: session.id, refreshToken };
}

export async function rotateUserSessionRefreshToken(
  refreshToken: string,
): Promise<{
  sessionId: string;
  userId: string;
  newRefreshToken: string;
}> {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await prisma.userSession.findFirst({
    where: { refreshTokenHash },
  });

  if (session) {
    if (session.expiresAt.getTime() <= Date.now()) {
      await prisma.userSession.deleteMany({ where: { id: session.id } });
      throw new AppError('Invalid or expired session', 401);
    }

    const newRefreshToken = generateRefreshToken();
    const newHash = hashRefreshToken(newRefreshToken);

    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        previousRefreshTokenHash: session.refreshTokenHash,
        refreshTokenHash: newHash,
        lastUsedAt: new Date(),
        expiresAt: refreshExpiresAt(),
      },
    });

    return {
      sessionId: session.id,
      userId: session.userId,
      newRefreshToken,
    };
  }

  // Reuse detection: presented token matches a rotated-away hash.
  const reused = await prisma.userSession.findFirst({
    where: { previousRefreshTokenHash: refreshTokenHash },
  });
  if (reused) {
    await revokeAllUserSessions(reused.userId);
    throw new AppError(
      'Session revoked due to refresh token reuse. Sign in again.',
      401,
    );
  }

  throw new AppError('Invalid or expired session', 401);
}

export async function revokeUserSession(sessionId: string, userId: string) {
  await prisma.userSession.deleteMany({
    where: { id: sessionId, userId },
  });
}

export async function revokeUserSessionByRefreshToken(refreshToken: string) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  await prisma.userSession.deleteMany({
    where: {
      OR: [
        { refreshTokenHash },
        { previousRefreshTokenHash: refreshTokenHash },
      ],
    },
  });
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.userSession.deleteMany({ where: { userId } });
}
