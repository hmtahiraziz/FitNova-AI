import React, { type ReactNode } from 'react';
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme/tokens';

type GlassSurfaceProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  /** When false, skips drop shadow even if pressable (e.g. Log toggles). */
  elevated?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Soft mist “glass” panel — prefer for interactive / tappable surfaces.
 */
export function GlassSurface({
  children,
  className = '',
  interactive = false,
  elevated,
  disabled = false,
  onPress,
  style,
}: GlassSurfaceProps) {
  const surfaceStyle: ViewStyle = {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
    // Never clip the 1px border / shadow (Android cuts edges with overflow:hidden).
    overflow: 'visible',
  };

  const wantsPress = interactive || Boolean(onPress);
  const isPressable = wantsPress && !disabled;
  const showElevation =
    elevated === false ? false : elevated === true ? true : isPressable;

  if (showElevation) {
    Object.assign(surfaceStyle, {
      shadowColor: colors.ink,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    });
  }

  if (wantsPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={isPressable ? onPress : undefined}
        className={className}
        style={({ pressed }) => [
          surfaceStyle,
          disabled ? { opacity: 0.65 } : null,
          pressed && isPressable ? { opacity: 0.92 } : null,
          style,
        ]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className={className} style={[surfaceStyle, style]}>
      {children}
    </View>
  );
}
