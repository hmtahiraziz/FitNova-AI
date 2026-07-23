import React from 'react';
import { View } from 'react-native';
import type { PlanGenerateFocus } from '../../api/plans';
import { Chip } from '../ui';

const GRID_GAP = 10;

type FocusOption = { value: PlanGenerateFocus; label: string };

type RegenerationFocusGridProps = {
  options: FocusOption[];
  value: PlanGenerateFocus;
  onChange: (value: PlanGenerateFocus) => void;
  disabled?: boolean;
};

/** 2×2 grid of focus chips (equal columns). */
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
          {row.map((opt) => (
            <View key={opt.value} style={{ width: '48%', minWidth: 0 }}>
              <Chip
                label={opt.label}
                selected={value === opt.value}
                disabled={disabled}
                pill
                onPress={() => onChange(opt.value)}
                className="w-full py-3"
              />
            </View>
          ))}
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
