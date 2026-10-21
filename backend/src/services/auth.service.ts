import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { env, googleAudiences } from '../config/env';
import { prisma } from '../lib/prisma';
import { sendPasswordResetEmail } from '../lib/mail';
import { AppError } from '../middleware/errorHandler';
import { signAccessToken } from '../middleware/auth';
import { deleteAvatarFilesForUser } from './avatar.service';
import {
  createUserSession,
  revokeUserSessionByRefreshToken,
  rotateUserSessionRefreshToken,
} from './session.service';
import type { SessionClientInfo } from '../utils/refreshToken';

const SALT_ROUNDS = 12;
const RESET_TTL_MS = 15 * 60 * 1000;

function publicUser(user: { id: string; email: string; googleId: string | null }) {
  return {
    id: user.id,
    email: user.email,
    hasGoogle: Boolean(user.googleId),
  };
}

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  /** @deprecated Use accessToken — kept for scripts and gradual migration */
  token: string;
  user: ReturnType<typeof publicUser>;
};

async function issueAuthTokens(
  user: { id: string; email: string; googleId: string | null },
  client: SessionClientInfo = {},
): Promise<AuthTokensResponse> {
  const { sessionId, refreshToken } = await createUserSession(user.id, client);
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    sessionId,
  });
  return {
    accessToken,
    refreshToken,
    token: accessToken,
    user: publicUser(user),
  };
}

export async function registerUser(
  email: string,
  password: string,
  client: SessionClientInfo = {},
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  return issueAuthTokens(user, client);
}

export async function loginUser(
  email: string,
  password: string,
  client: SessionClientInfo = {},
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError('Invalid email or password', 401);
  }

  return issueAuthTokens(user, client);
}

export async function loginWithGoogle(
  idToken: string,
  client: SessionClientInfo = {},
) {
  const audiences = googleAudiences();
  if (audiences.length === 0) {
    throw new AppError('Google Sign-In is not configured', 503);
  }

  const clientOAuth = new OAuth2Client();
  let payload;
  try {
    const ticket = await clientOAuth.verifyIdToken({
      idToken,
      audience: audiences,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError('Invalid Google token', 401);
  }

  if (!payload?.sub || !payload.email) {
    throw new AppError('Google account is missing email', 400);
  }

  if (payload.email_verified !== true) {
    throw new AppError('Google email is not verified', 401);
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;

  const existingByGoogle = await prisma.user.findUnique({
    where: { googleId },
  });
  if (existingByGoogle) {
    return issueAuthTokens(existingByGoogle, client);
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    // Never silently take over a password (or other) account via Google email match.
    // Identity is keyed by Google "sub"; linking requires an explicit future flow.
    throw new AppError(
      'An account with this email already exists. Sign in with email and password instead.',
      409,
      { code: 'EMAIL_ALREADY_REGISTERED' },
    );
  }

  const created = await prisma.user.create({
    data: { email, googleId },
  });
  return issueAuthTokens(created, client);
}

export async function refreshSession(refreshToken: string) {
  const rotated = await rotateUserSessionRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: rotated.userId },
  });
  if (!user) {
    throw new AppError('Invalid or expired session', 401);
  }

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    sessionId: rotated.sessionId,
  });

  return {
    accessToken,
    refreshToken: rotated.newRefreshToken,
    token: accessToken,
    user: publicUser(user),
  };
}

export async function logoutUser(refreshToken: string) {
  await revokeUserSessionByRefreshToken(refreshToken);
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  const generic = {
    message: 'If that email exists, a reset code has been sent.',
  };

  if (!user) {
    return generic;
  }

  if (!user.passwordHash && user.googleId) {
    return generic;
  }

  const code = String(crypto.randomInt(100000, 999999));
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
  const now = new Date();

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: now },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    }),
  ]);

  try {
    await sendPasswordResetEmail(email, code);
  } catch (err) {
    if (env.NODE_ENV === 'development') {
      console.warn('[dev] SMTP failed; reset code sent for account (check inbox config)');
      console.warn(err);
      return { ...generic, devCode: code };
    }
    throw err;
  }

  return generic;
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid or expired reset code', 400);
  }

  const tokens = await prisma.passwordResetToken.findMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  let matched: (typeof tokens)[number] | null = null;
  for (const token of tokens) {
    if (await bcrypt.compare(code, token.codeHash)) {
      matched = token;
      break;
    }
  }

  if (!matched) {
    throw new AppError('Invalid or expired reset code', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: matched.id },
      data: { usedAt: now },
    }),
    // Invalidate any other outstanding reset codes for this user.
    prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        id: { not: matched.id },
      },
      data: { usedAt: now },
    }),
    prisma.userSession.deleteMany({ where: { userId: user.id } }),
  ]);

  return { message: 'Password updated. You can sign in now.' };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return publicUser(user);
}

export async function deleteUserAccount(
  userId: string,
  input: { confirmation: 'DELETE'; password?: string },
) {
  if (input.confirmation !== 'DELETE') {
    throw new AppError('Confirmation required', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.passwordHash) {
    if (!input.password) {
      throw new AppError('Password is required to delete this account', 400);
    }
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError('Incorrect password', 401);
    }
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { avatarUrl: true },
  });
  await deleteAvatarFilesForUser(userId, profile?.avatarUrl);

  await prisma.user.delete({ where: { id: userId } });

  return { message: 'Account deleted' };
}
