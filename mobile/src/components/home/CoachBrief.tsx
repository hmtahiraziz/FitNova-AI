import React from 'react';
import { Text } from 'react-native';
import type { Plan } from '../../api/plans';
import { GlassSurface } from '../ui/GlassSurface';

type CoachBriefProps = {
  plan: Plan | null;
  goal?: string | null;
};

export function CoachBrief({ plan, goal }: CoachBriefProps) {
  const goalLabel = goal ? goal.replace(/_/g, ' ') : 'your goal';
  const line = plan?.content.summary
    ? plan.content.summary
    : `Your coach is ready — generate a plan tailored to ${goalLabel}.`;

  return (
    <GlassSurface className="mb-5 px-5 py-4">
      <Text className="font-sans-medium text-xs uppercase tracking-wide text-slate">
        Coach brief
      </Text>
      <Text className="mt-2 font-sans text-base leading-6 text-ink">{line}</Text>
    </GlassSurface>
  );
}
