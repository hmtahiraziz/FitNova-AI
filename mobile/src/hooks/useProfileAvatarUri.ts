import { useEffect, useState } from 'react';
import { fetchProfileAvatarDataUri } from '../api/profileAvatar';
import { resolveAvatarUrl } from '../lib/resolveAvatarUrl';

function isPublicAbsoluteUrl(avatarUrl: string): boolean {
  return (
    /^https?:\/\//i.test(avatarUrl) &&
    !avatarUrl.includes('/uploads/') &&
    !avatarUrl.includes('/profile/avatar')
  );
}

/** Soft cache so Home + Profile don't re-download the same photo. */
let memoryCache: { key: string; uri: string } | null = null;

function cacheKeyOf(
  avatarUrl: string,
  cacheKey?: string | number,
): string {
  return `${avatarUrl}|${cacheKey ?? ''}`;
}

/**
 * Resolves a displayable avatar URI (data URI or public URL).
 * Auth-gated photos are fetched via axios (RN Image drops auth headers).
 */
export function useProfileAvatarUri(
  avatarUrl: string | null | undefined,
  cacheKey?: string | number,
): { uri: string | null; loading: boolean } {
  const raw = avatarUrl?.trim() || '';
  const [uri, setUri] = useState<string | null>(() => {
    if (!raw) {
      return null;
    }
    if (isPublicAbsoluteUrl(raw)) {
      return resolveAvatarUrl(raw, cacheKey);
    }
    const key = cacheKeyOf(raw, cacheKey);
    return memoryCache?.key === key ? memoryCache.uri : null;
  });
  const [loading, setLoading] = useState(() => {
    if (!raw || isPublicAbsoluteUrl(raw)) {
      return false;
    }
    const key = cacheKeyOf(raw, cacheKey);
    return memoryCache?.key !== key;
  });

  useEffect(() => {
    let cancelled = false;

    if (!raw) {
      setUri(null);
      setLoading(false);
      return;
    }

    if (isPublicAbsoluteUrl(raw)) {
      setUri(resolveAvatarUrl(raw, cacheKey));
      setLoading(false);
      return;
    }

    const key = cacheKeyOf(raw, cacheKey);
    if (memoryCache?.key === key) {
      setUri(memoryCache.uri);
      setLoading(false);
      return;
    }

    setLoading(true);
    setUri(null);

    void (async () => {
      try {
        const next = await fetchProfileAvatarDataUri(cacheKey);
        memoryCache = { key, uri: next };
        if (!cancelled) {
          setUri(next);
        }
      } catch {
        if (!cancelled) {
          setUri(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [raw, cacheKey]);

  return { uri, loading };
}

/** Call after remove so Home doesn't keep showing a deleted photo. */
export function clearProfileAvatarUriCache() {
  memoryCache = null;
}
