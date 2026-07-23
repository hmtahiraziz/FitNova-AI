import React from 'react';
import { Text, View } from 'react-native';
import type { PlanExercise } from '../../api/plans';
import { colors, fonts } from '../../theme/tokens';

type WorkoutExerciseRowProps = PlanExercise & {
  stepNumber: number;
  isLast?: boolean;
  variant?: 'list' | 'compact';
};

export function WorkoutExerciseRow({
  name,
  sets,
  reps,
  notes,
  stepNumber,
  isLast = false,
  variant = 'list',
}: WorkoutExerciseRowProps) {
  const isCompact = variant === 'compact';

  return (
    <View
      className={`min-w-0 flex-row gap-3 ${isLast ? '' : 'mb-4 pb-4 border-b border-ink/5'}`}>
      <View
        style={{
          width: isCompact ? 28 : 32,
          height: isCompact ? 28 : 32,
          borderRadius: isCompact ? 14 : 16,
          backgroundColor: colors.mint,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}>
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: isCompact ? 13 : 14,
            color: colors.ink,
          }}>
          {stepNumber}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className="min-w-0 flex-1 font-sans-semibold text-ink"
            style={{ fontSize: 15, lineHeight: 22 }}>
            {name}
          </Text>
          <View
            className="shrink-0 rounded-full px-2.5 py-1"
            style={{ backgroundColor: `${colors.sage}44` }}>
            <Text
              className="font-sans-medium tabular-nums text-ink"
              style={{ fontSize: 12, lineHeight: 16 }}>
              {sets} × {reps}
            </Text>
          </View>
        </View>
        <Text
          className="mt-1 font-sans-medium text-slate"
          style={{ fontSize: 12, lineHeight: 16 }}>
          {sets} set{sets === 1 ? '' : 's'} · {reps} reps
        </Text>
        {notes ? (
          <Text
            className="mt-2 font-sans text-slate"
            style={{ fontSize: 13, lineHeight: 20 }}>
            {notes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
