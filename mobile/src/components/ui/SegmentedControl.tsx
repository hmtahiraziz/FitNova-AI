import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme/tokens';

export type SegmentOption<T extends string> = {
  key: T;
  label: string;
  accessibilityLabel?: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  const { isCompact } = useResponsive();

  return (
    <View
      className={`w-full overflow-hidden ${className}`}
      style={{
        borderRadius: 999,
        backgroundColor: 'rgba(11, 31, 26, 0.06)',
        padding: 4,
      }}>
      <View className="min-w-0 flex-row">
        {options.map((option) => {
          const selected = value === option.key;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.accessibilityLabel ?? option.label}
              onPress={() => onChange(option.key)}
              className="min-w-0 flex-1 items-center justify-center px-1 py-2.5"
              style={{
                borderRadius: 999,
                backgroundColor: selected ? colors.ink : 'transparent',
              }}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                className={`text-center font-sans-semibold ${
                  isCompact ? 'text-xs' : 'text-sm'
                } ${selected ? 'text-mist' : 'text-slate'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
