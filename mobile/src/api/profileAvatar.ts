import { apiRequest, apiUpload } from './client';
import type { Profile } from './profile';

type UploadAsset = {
  uri: string;
  type?: string | null;
  fileName?: string | null;
};

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
