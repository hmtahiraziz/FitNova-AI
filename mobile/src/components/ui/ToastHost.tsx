import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '../../store/toastStore';
import { colors } from '../../theme/tokens';

const variantBg: Record<string, string> = {
  success: colors.ink,
  error: colors.coral,
  info: colors.ink,
};

type Props = {
  offlineOffset?: number;
};

export function ToastHost({ offlineOffset = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const variant = useToastStore((s) => s.variant);
  const hide = useToastStore((s) => s.hide);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-12);

  useEffect(() => {
    if (!message) {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(-12, { duration: 180 });
      return;
    }
    opacity.value = withTiming(1, { duration: 220 });
    translateY.value = withTiming(0, { duration: 220 });
    const t = setTimeout(() => hide(), 4000);
    return () => clearTimeout(t);
  }, [message, hide, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          top: insets.top + 8 + offlineOffset,
          left: 16,
          right: 16,
          zIndex: 9999,
        },
        style,
      ]}>
      <Pressable onPress={hide}>
        <View
          style={{
            backgroundColor: variantBg[variant] ?? colors.ink,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
          }}>
          <Text className="text-center font-sans-medium text-sm text-mist">
            {message}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
