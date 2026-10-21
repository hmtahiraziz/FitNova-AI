import React from 'react';
import {
  Platform,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, fonts } from '../../theme/tokens';

type HeaderTitleProps = {
  children: string;
  compact?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

/**
 * Screen titles — Manrope SemiBold (reliable descenders on Android).
 * Responsive: smaller on compact phones, larger on tablet / wide layouts.
 */
export function HeaderTitle({
  children,
  compact: compactProp,
  style,
  numberOfLines = 2,
}: HeaderTitleProps) {
  const { isCompact, isTablet } = useResponsive();
  const compact = compactProp ?? isCompact;
  const fontSize = isTablet ? 32 : compact ? 26 : 28;
  const lineHeight = Math.ceil(fontSize * 1.35);

  return (
    <View style={{ overflow: 'visible' }}>
      <Text
        accessibilityRole="header"
        numberOfLines={numberOfLines}
        style={[
          {
            fontFamily: fonts.sansSemiBold,
            fontSize,
            lineHeight,
            color: colors.ink,
            letterSpacing: -0.3,
            ...(Platform.OS === 'android'
              ? {
                  includeFontPadding: true,
                  textAlignVertical: 'center' as const,
                  paddingBottom: 2,
                }
              : { paddingBottom: 1 }),
          },
          style,
        ]}>
        {children}
      </Text>
    </View>
  );
}
