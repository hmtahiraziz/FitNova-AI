import fs from 'fs/promises';
import path from 'path';
import { uploadsRoot } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

function avatarDir(): string {
  return path.join(uploadsRoot(), 'avatars');
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;

function extensionForMime(mime: string): 'jpg' | 'png' | 'webp' {
  if (mime === 'image/png') {
    return 'png';
  }
  if (mime === 'image/webp') {
    return 'webp';
  }
  return 'jpg';
}

async function removeAvatarFiles(userId: string) {
  const dir = avatarDir();
  for (const ext of ['jpg', 'png', 'webp'] as const) {
    const filePath = path.join(dir, `${userId}.${ext}`);
    try {
      await fs.unlink(filePath);
    } catch {
      /* ignore missing */
    }
  }
}

export async function setProfileAvatar(
  userId: string,
  file: Express.Multer.File,
) {
  if (!file.buffer?.length) {
    throw new AppError('No image uploaded', 400);
  }
  if (file.size > MAX_BYTES) {
    throw new AppError('Image must be 5 MB or smaller', 400);
  }
  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw new AppError('Use a JPEG, PNG, or WebP photo', 400);
  }

  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (!existing) {
    throw new AppError('Complete your profile before adding a photo', 400);
  }

  const dir = avatarDir();
  await fs.mkdir(dir, { recursive: true });
  await removeAvatarFiles(userId);

  const ext = extensionForMime(file.mimetype);
  const filename = `${userId}.${ext}`;
  await fs.writeFile(path.join(dir, filename), file.buffer);

  const avatarUrl = `/uploads/avatars/${filename}`;
  await prisma.profile.update({
    where: { userId },
    data: { avatarUrl },
  });

  return avatarUrl;
}

export async function clearProfileAvatar(userId: string) {
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (!existing) {
    throw new AppError('Profile not found', 404);
  }

  await removeAvatarFiles(userId);

  const profile = await prisma.profile.update({
    where: { userId },
    data: { avatarUrl: null },
  });

  return profile.avatarUrl;
}

export async function ensureUploadDirs() {
  await fs.mkdir(avatarDir(), { recursive: true });
}
