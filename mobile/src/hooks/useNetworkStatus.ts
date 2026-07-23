import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const apply = (connected: boolean | null, reachable: boolean | null) => {
      if (connected === false) {
        setIsOffline(true);
        return;
      }
      if (reachable === false) {
        setIsOffline(true);
        return;
      }
      setIsOffline(false);
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
