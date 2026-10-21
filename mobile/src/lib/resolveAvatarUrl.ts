import { API_BASE_URL } from '../config/env';

/**
 * Build a fetchable URL for the authenticated profile avatar endpoint.
 * Legacy `/uploads/...` values from older API responses are rewritten.
 */
export function resolveAvatarUrl(
  avatarUrl: string | null | undefined,
  cacheKey?: string | number,
): string | null {
  if (!avatarUrl?.trim()) {
    return null;
  }

  const base = API_BASE_URL.replace(/\/$/, '');
  // Always use the auth-gated route; never hit public /uploads.
  let url = `${base}/profile/avatar`;

  if (/^https?:\/\//i.test(avatarUrl) && !avatarUrl.includes('/uploads/')) {
    // Absolute CDN/signed URLs (future) — allow as-is.
    url = avatarUrl;
  }

  if (cacheKey == null) {
    return url;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(String(cacheKey))}`;
}
