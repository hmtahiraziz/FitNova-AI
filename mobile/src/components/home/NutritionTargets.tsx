import React from 'react';
import { Text, View } from 'react-native';
import type { Plan } from '../../api/plans';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, fonts } from '../../theme/tokens';

type NutritionTargetsProps = {
  plan: Plan;
};

export function NutritionTargets({ plan }: NutritionTargetsProps) {
  const { calorieGuidance, proteinNote } = plan.content.targets;

  return (
    <GlassSurface className="mb-2 px-5 py-4" style={{ borderRadius: 22 }}>
      <View className="mb-3 flex-row items-center justify-between gap-2">
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 16,
            lineHeight: 22,
            color: colors.ink,
          }}>
          Nutrition targets
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
            From plan
          </Text>
        </View>
      </View>

      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: colors.mint,
          paddingLeft: 12,
          marginBottom: 14,
        }}>
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 11,
            lineHeight: 14,
            letterSpacing: 0.5,
            color: colors.slate,
          }}>
          ENERGY
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: fonts.sans,
            fontSize: 14,
            lineHeight: 20,
            color: colors.ink,
          }}>
          {calorieGuidance}
        </Text>
      </View>

      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: colors.sage,
          paddingLeft: 12,
        }}>
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 11,
            lineHeight: 14,
            letterSpacing: 0.5,
            color: colors.slate,
          }}>
          PROTEIN
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: fonts.sans,
            fontSize: 14,
            lineHeight: 20,
            color: colors.ink,
          }}>
          {proteinNote}
        </Text>
      </View>
    </GlassSurface>
  );
}
