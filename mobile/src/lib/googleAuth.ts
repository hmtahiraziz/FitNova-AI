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

/**
 * Clears the cached Google session so the next sign-in shows the account picker.
 * Safe to call when the user was never signed in with Google.
 */
export async function clearGoogleSession(): Promise<void> {
  if (!GOOGLE_WEB_CLIENT_ID) {
    return;
  }
  try {
    configureGoogleSignIn();
    // Always attempt signOut — getCurrentUser can be stale on some Android builds.
    await GoogleSignin.signOut();
  } catch {
    // Best-effort — never block app logout / auth.
  }
}

/**
 * Opens the Google account picker and returns an ID token for the API.
 * Signs out any cached Google user first so the chooser always appears
 * (professional Continue-with-Google on Sign in and Create account).
 */
export async function getGoogleIdToken(): Promise<string> {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      'Google Sign-In is not configured. Set GOOGLE_WEB_CLIENT_ID in mobile/.env.',
    );
  }
  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Force account selection every time (same UX on Login + Register).
  await clearGoogleSession();

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
