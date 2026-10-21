import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { HeaderTitle } from './HeaderTitle';

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

  return (
    <View className="mb-5 min-w-0 w-full" style={{ overflow: 'visible' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        hitSlop={12}
        className="mb-3 self-start rounded-full border border-ink/10 bg-mist/80 px-3 py-1.5">
        <Text className="font-sans-semibold text-sm text-ink">
          ← {backLabel}
        </Text>
      </Pressable>
      <HeaderTitle>{title}</HeaderTitle>
      {subtitle ? (
        <Text
          className={`mt-1 min-w-0 font-sans leading-6 text-slate ${
            isCompact ? 'text-sm' : 'text-base'
          }`}
          numberOfLines={3}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
