import React from 'react';
import { Text } from 'react-native';
import type { Plan } from '../../api/plans';
import { GlassSurface } from '../ui/GlassSurface';
import { SecondaryButton } from '../ui';

type PlanSnapshotWidgetProps = {
  plan: Plan | null;
  onPressPlan: () => void;
};

export function PlanSnapshotWidget({
  plan,
  onPressPlan,
}: PlanSnapshotWidgetProps) {
  if (!plan) {
    return null;
  }

  return (
    <GlassSurface className="mb-5 px-5 py-4" interactive>
      <Text className="font-sans-semibold text-lg text-ink">Your plan</Text>
      <Text className="mt-2 font-sans text-base leading-6 text-slate">
        {plan.content.summary}
      </Text>
      <Text className="mt-3 font-sans text-sm leading-5 text-slate">
        {plan.content.targets.calorieGuidance}
      </Text>
      <SecondaryButton
        className="mt-4"
        label="View plan"
        onPress={onPressPlan}
      />
    </GlassSurface>
  );
}
