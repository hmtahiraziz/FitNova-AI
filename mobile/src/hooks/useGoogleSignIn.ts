import { useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getGoogleIdToken } from '../lib/googleAuth';

export function useGoogleSignIn(onError?: (message: string) => void) {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const [googleLoading, setGoogleLoading] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const idToken = await getGoogleIdToken();
      await loginWithGoogle(idToken);
    } catch (err) {
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
