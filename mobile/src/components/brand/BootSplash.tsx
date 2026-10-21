import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '../../theme/tokens';
import { AppLogo } from './AppLogo';

type BootSplashProps = {
  label?: string;
};

/** Soft branded launch surface — avoids hard spinner / screen flashes. */
export function BootSplash({ label = 'Starting FitNova…' }: BootSplashProps) {
  const opacity = useSharedValue(0);
  const rise = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 320 });
    rise.value = withTiming(0, { duration: 320 });
  }, [opacity, rise]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: rise.value }],
  }));

  return (
    <Animated.View style={[styles.root, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.mist} />
      <AppLogo variant="hero" />
      <ActivityIndicator
        color={colors.mint}
        size="small"
        style={styles.spinner}
      />
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  spinner: {
    marginTop: 28,
  },
  label: {
    marginTop: 14,
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.slate,
    textAlign: 'center',
  },
});
