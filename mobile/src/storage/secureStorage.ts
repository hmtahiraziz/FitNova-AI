import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.b4fitness.auth.refresh';

export async function saveRefreshToken(refreshToken: string): Promise<void> {
  await Keychain.setGenericPassword('refresh', refreshToken, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadRefreshToken(): Promise<string | null> {
  const creds = await Keychain.getGenericPassword({ service: SERVICE });
  if (!creds || typeof creds === 'boolean') {
    return null;
  }
  return creds.password || null;
}

export async function clearRefreshToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
