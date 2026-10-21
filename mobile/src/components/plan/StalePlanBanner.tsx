import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, fonts } from '../../theme/tokens';

type Props = {
  onRegenerate: () => void;
};

export function StalePlanBanner({ onRegenerate }: Props) {
  return (
    <GlassSurface
      className="mb-4 px-4 py-4"
      style={{
        borderRadius: 20,
        borderColor: `${colors.mint}88`,
      }}>
      <View className="mb-1 flex-row items-center justify-between gap-2">
        <Text className="font-sans-semibold text-base text-ink">
          Profile updated
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: `${colors.mint}33`,
          }}>
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 10,
              lineHeight: 13,
              color: colors.ink,
            }}>
            Refresh
          </Text>
        </View>
      </View>
      <Text className="mt-1 font-sans text-sm leading-5 text-slate">
        Your workout and meal plan may not match your latest preferences.
        Regenerate for updated guidance.
      </Text>
      <Pressable
        onPress={onRegenerate}
        className="mt-3 self-start rounded-full bg-ink px-4 py-2.5">
        <Text className="font-sans-semibold text-sm text-mist">
          Regenerate plan
        </Text>
      </Pressable>
    </GlassSurface>
  );
}

export function GenerationsQuotaHint({
  remaining,
  limit,
}: {
  remaining: number;
  limit: number;
}) {
  return (
    <Text className="font-sans text-xs text-slate">
      {remaining} of {limit} generations left this hour
    </Text>
  );
}
