import crypto from 'crypto';
import { env } from '../config/env';

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

export function hashRefreshToken(refreshToken: string): string {
  return crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(refreshToken)
    .digest('hex');
}

export type SessionClientInfo = {
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  appVersion?: string;
  ipAddress?: string;
};
