import React from 'react';
import { Text, View } from 'react-native';
import { GlassSurface } from '../ui/GlassSurface';
import { colors, fonts } from '../../theme/tokens';

type MissionToggleProps = {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

const CARD_RADIUS = 20;

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
      className="mb-2.5 px-4 py-3.5"
      style={{
        borderRadius: CARD_RADIUS,
        borderColor: value ? `${colors.mint}88` : colors.glassBorder,
        backgroundColor: value ? `${colors.mint}22` : colors.glass,
      }}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 shrink">
          <View className="flex-row items-center gap-2">
            <Text
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: fonts.sansSemiBold,
                fontSize: 15,
                lineHeight: 20,
                color: colors.ink,
              }}>
              {label}
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: value
                  ? `${colors.mint}55`
                  : `${colors.sage}44`,
              }}>
              <Text
                style={{
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 10,
                  lineHeight: 13,
                  color: colors.ink,
                }}>
                {value ? 'Done' : 'Todo'}
              </Text>
            </View>
          </View>
          <Text
            style={{
              marginTop: 6,
              fontFamily: fonts.sans,
              fontSize: 13,
              lineHeight: 18,
              color: colors.slate,
            }}>
            {description}
          </Text>
        </View>
        <View
          style={{
            width: 52,
            height: 30,
            borderRadius: 999,
            paddingHorizontal: 3,
            justifyContent: 'center',
            backgroundColor: value ? colors.ink : `${colors.sage}73`,
            borderWidth: 1,
            borderColor: value ? `${colors.mint}66` : colors.glassBorder,
          }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              alignSelf: value ? 'flex-end' : 'flex-start',
              backgroundColor: value ? colors.mint : colors.mist,
              borderWidth: value ? 0 : 1,
              borderColor: colors.glassBorder,
            }}
          />
        </View>
      </View>
    </GlassSurface>
  );
}
