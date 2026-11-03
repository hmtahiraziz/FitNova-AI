import { useCallback, useState } from 'react';
import {
  ACCOUNT_EXISTS_MESSAGE,
  isEmailAlreadyRegistered,
} from '../lib/authErrors';
import { getGoogleIdToken } from '../lib/googleAuth';
import { useAuthStore } from '../store/authStore';

/**
 * Shared Continue-with-Google for Welcome, Login, and Register.
 * Account picker → API create-or-login → RootNavigator routes:
 * incomplete profile → Onboarding · complete → Home.
 */
export function useGoogleSignIn(onError?: (message: string) => void) {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const [googleLoading, setGoogleLoading] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const idToken = await getGoogleIdToken();
      await loginWithGoogle(idToken);
    } catch (err) {
      if (isEmailAlreadyRegistered(err)) {
        onError?.(ACCOUNT_EXISTS_MESSAGE);
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Google sign-in failed';
      if (!message.toLowerCase().includes('cancel')) {
        onError?.(message);
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, onError]);

  return { signInWithGoogle, googleLoading };
}
