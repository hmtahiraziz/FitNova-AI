import React from 'react';
import { Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { HeaderTitle } from '../ui/HeaderTitle';

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

  return (
    <View className="w-full" style={{ marginTop: 24, overflow: 'visible' }}>
      <HeaderTitle compact={isCompact || compact}>
        {`${greetingPrefix}, ${displayName} 👋`}
      </HeaderTitle>
      <Text
        className="mt-1.5 font-sans text-base leading-6 text-ink"
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
