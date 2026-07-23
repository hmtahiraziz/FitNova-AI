import { API_BASE_URL } from '../config/env';

/** Build a fetchable URL for profile avatars stored on the API. */
export function resolveAvatarUrl(
  avatarUrl: string | null | undefined,
  cacheKey?: string | number,
): string | null {
  if (!avatarUrl?.trim()) {
    return null;
  }
  if (/^https?:\/\//i.test(avatarUrl)) {
    return avatarUrl;
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  const url = `${base}${path}`;
  if (cacheKey == null) {
    return url;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(String(cacheKey))}`;
}
