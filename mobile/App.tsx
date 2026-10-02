import './global.css';
import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ReminderBootstrap } from './src/lib/ReminderBootstrap';
import { useAuthStore } from './src/store/authStore';
import { configureGoogleSignIn } from './src/lib/googleAuth';
import { OfflineBanner, ToastHost } from './src/components/ui';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { colors } from './src/theme/tokens';

function AppContent() {
  const { isOffline } = useNetworkStatus();

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner visible={isOffline} />
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={colors.mist} />
        <ReminderBootstrap />
        <RootNavigator />
      </NavigationContainer>
      <ToastHost offlineOffset={isOffline ? 36 : 0} />
    </View>
  );
}

/** Avoid hanging forever if persist hydration already finished (or never fires). */
function waitForPersistHydration(timeoutMs = 2000): Promise<void> {
  if (useAuthStore.persist.hasHydrated()) {
    return Promise.resolve();
  }

  return Promise.race([
    new Promise<void>((resolve) => {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        unsub();
        resolve();
      });
      // Race: hydration may complete between hasHydrated() and subscribe.
      if (useAuthStore.persist.hasHydrated()) {
        unsub();
        resolve();
      }
    }),
    new Promise<void>((resolve) => {
      setTimeout(resolve, timeoutMs);
    }),
  ]);
}

function App() {
  useEffect(() => {
    configureGoogleSignIn();
    const boot = async () => {
      try {
        await waitForPersistHydration();
        await useAuthStore.getState().bootstrap();
      } catch {
        // Network / refresh failures are handled inside bootstrap; never block UI.
      } finally {
        useAuthStore.getState().setHydrated(true);
      }
    };
    void boot();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
