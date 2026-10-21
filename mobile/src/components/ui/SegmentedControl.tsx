import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { colors, fonts } from '../../theme/tokens';

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

const OUTER_RADIUS = 18;
const INNER_RADIUS = 14;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  const { isCompact } = useResponsive();

  return (
    <View
      className={`w-full ${className}`}
      style={{
        borderRadius: OUTER_RADIUS,
        backgroundColor: colors.mist,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: 5,
        // Soft professional elevation — keep overflow visible so shadow isn't clipped.
        overflow: 'visible',
        shadowColor: colors.ink,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
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
              className="min-w-0 flex-1 items-center justify-center"
              style={{
                minHeight: isCompact ? 40 : 44,
                paddingHorizontal: 6,
                paddingVertical: 10,
                borderRadius: INNER_RADIUS,
                backgroundColor: selected ? colors.ink : 'transparent',
                ...(selected
                  ? {
                      shadowColor: colors.ink,
                      shadowOpacity: 0.16,
                      shadowRadius: 5,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 2,
                    }
                  : null),
              }}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                style={{
                  textAlign: 'center',
                  fontFamily: fonts.sansSemiBold,
                  fontSize: isCompact ? 12 : 13,
                  lineHeight: isCompact ? 16 : 18,
                  letterSpacing: 0.2,
                  color: selected ? colors.mist : colors.slate,
                }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
