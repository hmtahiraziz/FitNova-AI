import { ApiError, apiHttp, apiRequest, apiUpload } from './client';
import type { Profile } from './profile';

type UploadAsset = {
  uri: string;
  type?: string | null;
  fileName?: string | null;
};

/** RN Image often drops Authorization headers; load bytes via axios instead. */
function bytesToBase64(bytes: Uint8Array): string {
  // Keep chunks small — fromCharCode arg limits vary by JS engine.
  const chunkSize = 0x2000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return globalThis.btoa(binary);
}

/**
 * Fetch the auth-gated avatar and return a data URI safe for <Image>.
 */
export async function fetchProfileAvatarDataUri(
  cacheKey?: string | number,
): Promise<string> {
  const path =
    cacheKey == null
      ? '/profile/avatar'
      : `/profile/avatar?v=${encodeURIComponent(String(cacheKey))}`;

  try {
    const res = await apiHttp.get<ArrayBuffer>(path, {
      responseType: 'arraybuffer',
      headers: { Accept: 'image/jpeg,image/*,*/*' },
      // Images can be up to ~5MB before server re-encode; allow slow Wi‑Fi.
      timeout: 30_000,
    });

    const rawType = res.headers['content-type'];
    const contentType =
      (typeof rawType === 'string' ? rawType : rawType?.[0])
        ?.split(';')[0]
        ?.trim() || 'image/jpeg';

    const bytes = new Uint8Array(res.data);
    if (bytes.byteLength === 0) {
      throw new ApiError('Empty profile photo', 404);
    }

    return `data:${contentType};base64,${bytesToBase64(bytes)}`;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError('Could not load profile photo', 0, err);
  }
}

export async function uploadProfileAvatar(
  _token: string,
  asset: UploadAsset,
): Promise<{ profile: Profile }> {
  const form = new FormData();
  const name = asset.fileName?.trim() || 'avatar.jpg';
  const type = asset.type?.trim() || 'image/jpeg';

  form.append('avatar', {
    uri: asset.uri,
    type,
    name,
  } as unknown as Blob);

  return apiUpload<{ profile: Profile }>('/profile/avatar', form, 'POST');
}

export async function deleteProfileAvatar(
  _token: string,
): Promise<{ profile: Profile }> {
  return apiRequest<{ profile: Profile }>('/profile/avatar', {
    method: 'DELETE',
  });
}
