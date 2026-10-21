import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PlanGenerateFocus } from '../../api/plans';
import { colors, fonts } from '../../theme/tokens';
import { GlassSurface } from '../ui/GlassSurface';

const GRID_GAP = 10;
const CARD_RADIUS = 18;

export type FocusOption = {
  value: PlanGenerateFocus;
  label: string;
  description?: string;
};

type RegenerationFocusGridProps = {
  options: FocusOption[];
  value: PlanGenerateFocus;
  onChange: (value: PlanGenerateFocus) => void;
  disabled?: boolean;
};

/** 2×2 grid of focus cards with short descriptions. */
export function RegenerationFocusGrid({
  options,
  value,
  onChange,
  disabled = false,
}: RegenerationFocusGridProps) {
  const rows = [options.slice(0, 2), options.slice(2, 4)];

  return (
    <View style={{ gap: GRID_GAP }}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: GRID_GAP,
          }}>
          {row.map((opt) => {
            const selected = value === opt.value;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onChange(opt.value)}
                style={{ width: '48%', minWidth: 0, opacity: disabled ? 0.55 : 1 }}>
                <GlassSurface
                  className="px-3.5 py-3.5"
                  style={{
                    borderRadius: CARD_RADIUS,
                    borderColor: selected
                      ? `${colors.mint}AA`
                      : colors.glassBorder,
                    backgroundColor: selected
                      ? `${colors.mint}22`
                      : colors.glass,
                  }}>
                  <View className="flex-row items-center justify-between gap-1">
                    <Text
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: fonts.sansSemiBold,
                        fontSize: 14,
                        lineHeight: 18,
                        color: colors.ink,
                      }}
                      numberOfLines={1}>
                      {opt.label}
                    </Text>
                    {selected ? (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: colors.mint,
                        }}
                      />
                    ) : null}
                  </View>
                  {opt.description ? (
                    <Text
                      style={{
                        marginTop: 6,
                        fontFamily: fonts.sans,
                        fontSize: 12,
                        lineHeight: 16,
                        color: colors.slate,
                      }}
                      numberOfLines={3}>
                      {opt.description}
                    </Text>
                  ) : null}
                </GlassSurface>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function focusOptionLabel(
  focus: PlanGenerateFocus,
  options: FocusOption[],
): string {
  return options.find((o) => o.value === focus)?.label ?? focus;
}
