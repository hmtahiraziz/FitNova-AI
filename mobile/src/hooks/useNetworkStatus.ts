import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { setOfflineFlag } from '../lib/offline';

function resolveOffline(
  connected: boolean | null,
  reachable: boolean | null,
): boolean {
  if (connected === false) {
    return true;
  }
  // null reachable = unknown (common on Android) — treat as online.
  if (reachable === false) {
    return true;
  }
  return false;
}

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const apply = (connected: boolean | null, reachable: boolean | null) => {
      const next = resolveOffline(connected, reachable);
      setOfflineFlag(next);
      setIsOffline(next);
    };

    const unsub = NetInfo.addEventListener((state) => {
      apply(state.isConnected, state.isInternetReachable);
    });

    void NetInfo.fetch().then((state) => {
      apply(state.isConnected, state.isInternetReachable);
    });

    return unsub;
  }, []);

  return { isOffline };
}
