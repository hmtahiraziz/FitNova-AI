import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import {
  generateRefreshToken,
  hashRefreshToken,
  type SessionClientInfo,
} from '../utils/refreshToken';

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

  if (!session) {
    throw new AppError('Invalid or expired session', 401);
  }

  const newRefreshToken = generateRefreshToken();
  const newHash = hashRefreshToken(newRefreshToken);

  await prisma.userSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: newHash,
      lastUsedAt: new Date(),
    },
  });

  return {
    sessionId: session.id,
    userId: session.userId,
    newRefreshToken,
  };
}

export async function revokeUserSession(sessionId: string, userId: string) {
  await prisma.userSession.deleteMany({
    where: { id: sessionId, userId },
  });
}

export async function revokeUserSessionByRefreshToken(refreshToken: string) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  await prisma.userSession.deleteMany({
    where: { refreshTokenHash },
  });
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.userSession.deleteMany({ where: { userId } });
}
