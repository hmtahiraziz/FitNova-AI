import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { displayTitleStyle } from '../../theme/tokens';

type StackScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
};

export function StackScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
}: StackScreenHeaderProps) {
  const { isCompact } = useResponsive();
  const titleStyle = {
    ...displayTitleStyle(isCompact),
    ...(Platform.OS === 'android' ? { includeFontPadding: false as const } : {}),
    paddingBottom: 2,
  };

  return (
    <View className="mb-5 min-w-0 w-full">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        hitSlop={12}
        className="mb-3 self-start rounded-full border border-ink/10 bg-mist/80 px-3 py-1.5">
        <Text className="font-sans-semibold text-sm text-ink">← {backLabel}</Text>
      </Pressable>
      <Text
        style={titleStyle}
        className="min-w-0"
        accessibilityRole="header"
        numberOfLines={2}
        minimumFontScale={0.82}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          className={`mt-2 min-w-0 font-sans leading-6 text-slate ${
            isCompact ? 'text-sm' : 'text-base'
          }`}
          numberOfLines={3}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
