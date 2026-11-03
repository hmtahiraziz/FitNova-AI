import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { uploadsRoot } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { detectImageType } from '../utils/imageMagic';

/** Client-facing avatar path (auth required). */
export const AVATAR_API_PATH = '/profile/avatar';

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1024;
const SAFE_FILENAME = /^[a-f0-9]{32}\.jpg$/i;
const LEGACY_FILENAME = /^[a-z0-9_-]+\.(jpg|jpeg|png|webp)$/i;

function avatarDir(): string {
  return path.join(uploadsRoot(), 'avatars');
}

function assertInsideAvatarDir(filePath: string): string {
  const root = path.resolve(avatarDir());
  const resolved = path.resolve(filePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new AppError('Invalid avatar path', 400);
  }
  return resolved;
}

function filenameFromStoredUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl?.trim()) {
    return null;
  }
  const base = path.basename(avatarUrl.trim());
  if (SAFE_FILENAME.test(base) || LEGACY_FILENAME.test(base)) {
    return base;
  }
  return null;
}

async function unlinkQuietly(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore missing */
  }
}

/** Remove stored avatar file(s) for a user (current + legacy userId.* names). */
export async function deleteAvatarFilesForUser(
  userId: string,
  storedAvatarUrl?: string | null,
) {
  const dir = avatarDir();
  const fromUrl = filenameFromStoredUrl(storedAvatarUrl);
  if (fromUrl) {
    await unlinkQuietly(assertInsideAvatarDir(path.join(dir, fromUrl)));
  }
  for (const ext of ['jpg', 'jpeg', 'png', 'webp'] as const) {
    await unlinkQuietly(assertInsideAvatarDir(path.join(dir, `${userId}.${ext}`)));
  }
}

async function reencodeToJpeg(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer, { failOn: 'error' })
      .rotate()
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new AppError('Could not process that image. Try another photo.', 400);
  }
}

export async function setProfileAvatar(
  userId: string,
  file: Express.Multer.File,
) {
  if (!file.buffer?.length) {
    throw new AppError('No image uploaded', 400);
  }
  if (file.size > MAX_BYTES || file.buffer.length > MAX_BYTES) {
    throw new AppError('Image must be 5 MB or smaller', 400);
  }

  const detected = detectImageType(file.buffer);
  if (!detected) {
    throw new AppError('Use a JPEG, PNG, or WebP photo', 400);
  }

  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (!existing) {
    throw new AppError('Complete your profile before adding a photo', 400);
  }

  const jpeg = await reencodeToJpeg(file.buffer);
  const filename = `${crypto.randomBytes(16).toString('hex')}.jpg`;
  const dir = avatarDir();
  await fs.mkdir(dir, { recursive: true });

  const dest = assertInsideAvatarDir(path.join(dir, filename));
  await deleteAvatarFilesForUser(userId, existing.avatarUrl);
  await fs.writeFile(dest, jpeg);

  // Store opaque relative path; API responses expose AVATAR_API_PATH only.
  const storedPath = `avatars/${filename}`;
  await prisma.profile.update({
    where: { userId },
    data: { avatarUrl: storedPath },
  });

  return AVATAR_API_PATH;
}

export async function clearProfileAvatar(userId: string) {
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (!existing) {
    throw new AppError('Profile not found', 404);
  }

  await deleteAvatarFilesForUser(userId, existing.avatarUrl);

  await prisma.profile.update({
    where: { userId },
    data: { avatarUrl: null },
  });

  return null;
}

export async function readProfileAvatar(
  userId: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { avatarUrl: true },
  });
  const filename = filenameFromStoredUrl(profile?.avatarUrl);
  if (!filename) {
    return null;
  }

  const filePath = assertInsideAvatarDir(path.join(avatarDir(), filename));
  try {
    const buffer = await fs.readFile(filePath);
    return { buffer, contentType: 'image/jpeg' };
  } catch {
    return null;
  }
}

export async function ensureUploadDirs() {
  await fs.mkdir(avatarDir(), { recursive: true });
}
