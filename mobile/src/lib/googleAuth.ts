import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../config/env';

let configured = false;

export function configureGoogleSignIn() {
  if (configured) {
    return;
  }
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

export async function getGoogleIdToken(): Promise<string> {
  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();

  if (result.type !== 'success') {
    throw new Error('Google sign-in was cancelled');
  }

  const idToken = result.data.idToken;
  if (!idToken) {
    const tokens = await GoogleSignin.getTokens();
    if (!tokens.idToken) {
      throw new Error('Google did not return an idToken');
    }
    return tokens.idToken;
  }

  return idToken;
}
