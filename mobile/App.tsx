import './global.css';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ReminderBootstrap } from './src/lib/ReminderBootstrap';
import { useAuthStore } from './src/store/authStore';
import { configureGoogleSignIn } from './src/lib/googleAuth';
import { BootSplash } from './src/components/brand/BootSplash';
import { AppDialogHost, OfflineBanner, ToastHost } from './src/components/ui';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { colors } from './src/theme/tokens';
import { CONFIG_ERROR } from './src/config/env';

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.mist },
  bootErrorContainer: {
    flex: 1,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  bootErrorTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  bootErrorMessage: {
    color: colors.slate,
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
});

function BootErrorScreen({ message }: { message: string }) {
  return (
    <View style={styles.bootErrorContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.mist} />
      <Text style={styles.bootErrorTitle}>FitNova could not start</Text>
      <Text style={styles.bootErrorMessage}>{message}</Text>
    </View>
  );
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <BootErrorScreen message={this.state.error.message} />;
    }

    return this.props.children;
  }
}

function AppContent() {
  const { isOffline } = useNetworkStatus();

  return (
    <View style={styles.fill}>
      <OfflineBanner visible={isOffline} />
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={colors.mist} />
        <ReminderBootstrap />
        <RootNavigator />
      </NavigationContainer>
      <ToastHost offlineOffset={isOffline ? 52 : 0} />
      <AppDialogHost />
    </View>
  );
}

/** Avoid hanging forever if persist hydration already finished (or never fires). */
function waitForPersistHydration(timeoutMs = 1200): Promise<void> {
  if (useAuthStore.persist.hasHydrated()) {
    return Promise.resolve();
  }

  return Promise.race([
    new Promise<void>((resolve) => {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        unsub();
        resolve();
      });
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
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    try {
      configureGoogleSignIn();
    } catch {
      // Google optional at boot; sign-in screens handle missing config.
    }

    let cancelled = false;

    const boot = async () => {
      try {
        // Restore session before first navigation paint — avoids Welcome → Home flash.
        await waitForPersistHydration(1200);
        await Promise.race([
          useAuthStore.getState().bootstrap(),
          new Promise<void>((resolve) => {
            setTimeout(resolve, 2200);
          }),
        ]);
      } catch {
        // Session restore is best-effort; Welcome/Login remain usable.
      }

      if (cancelled) {
        return;
      }

      useAuthStore.getState().setHydrated(true);
      setBooting(false);
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={styles.fill}>
        <SafeAreaProvider>
          {CONFIG_ERROR ? (
            <BootErrorScreen message={CONFIG_ERROR} />
          ) : booting ? (
            <BootSplash label="Starting FitNova…" />
          ) : (
            <AppContent />
          )}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}

export default App;
