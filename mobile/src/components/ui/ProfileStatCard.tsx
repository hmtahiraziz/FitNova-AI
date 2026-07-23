import React from 'react';
import { Text, View } from 'react-native';

type ProfileStatCardProps = {
  label: string;
  value: string;
  tone?: 'mint' | 'sage';
};

const toneClass = {
  mint: 'bg-mint/20',
  sage: 'bg-sage/35',
} as const;

export function ProfileStatCard({
  label,
  value,
  tone = 'mint',
}: ProfileStatCardProps) {
  return (
    <View className={`min-h-[88px] flex-1 rounded-3xl px-4 py-4 ${toneClass[tone]}`}>
      <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
        {label}
      </Text>
      <Text
        className="mt-2 font-sans-semibold text-lg leading-snug text-ink"
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.82}>
        {value}
      </Text>
    </View>
  );
}
