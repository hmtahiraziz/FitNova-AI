import React from 'react';
import { Text, View } from 'react-native';
import { GlassSurface } from '../ui/GlassSurface';
import { colors } from '../../theme/tokens';

type MissionToggleProps = {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function MissionToggle({
  label,
  description,
  value,
  onToggle,
  disabled = false,
}: MissionToggleProps) {
  return (
    <GlassSurface
      interactive
      elevated={false}
      disabled={disabled}
      onPress={onToggle}
      className="mb-3 px-4 py-4"
      style={{
        borderRadius: 24,
        borderColor: value ? 'rgba(46, 230, 166, 0.55)' : colors.glassBorder,
        backgroundColor: value ? 'rgba(46, 230, 166, 0.16)' : colors.glass,
      }}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 shrink">
          <Text className="font-sans-semibold text-base leading-5 text-ink">{label}</Text>
          <Text className="mt-1 font-sans text-sm leading-5 text-slate">{description}</Text>
        </View>
        <View
          className={`h-8 w-14 shrink-0 justify-center rounded-full px-1 ${
            value ? 'bg-ink' : 'bg-sage/45'
          }`}>
          <View
            className={`h-6 w-6 rounded-full ${
              value ? 'self-end bg-mint' : 'self-start bg-mist'
            }`}
          />
        </View>
      </View>
    </GlassSurface>
  );
}
