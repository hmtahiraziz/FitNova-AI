import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, fonts } from '../../theme/tokens';

type HomeGreetingProps = {
  displayName: string;
  dateLabel: string;
  /** e.g. "Hi, Khurram" — wave appended in UI */
  compact?: boolean;
};

export function HomeGreeting({
  displayName,
  dateLabel,
  compact = false,
}: HomeGreetingProps) {
  const { isCompact } = useResponsive();
  const greetingPrefix = compact ? 'Hi' : 'Welcome';
  const titleSize = isCompact ? 28 : 32;
  const titleLine = isCompact ? 36 : 40;

  return (
    <View className="min-w-0 w-full" style={{ marginTop: 24 }}>
      <Text
        accessibilityRole="header"
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{
          fontFamily: fonts.display,
          fontSize: titleSize,
          lineHeight: titleLine,
          color: colors.ink,
          ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
        }}>
        {greetingPrefix}, {displayName} 👋
      </Text>
      <Text
        className="mt-2 font-sans text-base leading-6 text-ink"
        numberOfLines={2}>
        Ready to crush today&apos;s goals?
      </Text>
      <Text
        className="mt-2 font-sans-medium text-[13px] leading-5 text-slate"
        numberOfLines={1}>
        {dateLabel}
      </Text>
    </View>
  );
}
