import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'b4-device-id';

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }
  const id = `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export type AuthClientInfo = {
  deviceId: string;
  deviceName: string;
  platform: string;
  appVersion: string;
};

export async function getAuthClientInfo(): Promise<AuthClientInfo> {
  const deviceId = await getDeviceId();
  return {
    deviceId,
    deviceName: Platform.OS === 'android' ? 'Android' : 'iOS',
    platform: Platform.OS,
    appVersion: '0.0.1',
  };
}
