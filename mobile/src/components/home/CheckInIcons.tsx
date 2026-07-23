import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme/tokens';

const STROKE = 1.75;

export type CheckInIconKind = 'streak' | 'workout' | 'meals' | 'week';

type IconProps = { size?: number; color?: string };

export function CheckInIcon({
  kind,
  size = 22,
  color = colors.ink,
}: IconProps & { kind: CheckInIconKind }) {
  switch (kind) {
    case 'streak':
      return <FlameIcon size={size} color={color} />;
    case 'workout':
      return <DumbbellIcon size={size} color={color} />;
    case 'meals':
      return <ForkIcon size={size} color={color} />;
    case 'week':
      return <BarsIcon size={size} color={color} />;
  }
}

function FlameIcon({ size, color }: IconProps) {
  const w = size;
  const h = size * 1.1;
  return (
    <View style={{ width: w, height: h, alignItems: 'center' }}>
      <View
        style={{
          width: w * 0.45,
          height: h * 0.55,
          borderWidth: STROKE,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: w * 0.35,
          borderTopRightRadius: w * 0.35,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: h * 0.22,
          width: STROKE,
          height: h * 0.35,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

function DumbbellIcon({ size, color }: IconProps) {
  const w = size * 1.15;
  const h = size * 0.55;
  const plate = h * 0.85;
  return (
    <View
      style={{
        width: w,
        height: h,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          width: plate * 0.35,
          height: plate,
          borderWidth: STROKE,
          borderColor: color,
          borderRadius: 2,
        }}
      />
      <View style={{ flex: 1, height: STROKE, backgroundColor: color }} />
      <View
        style={{
          width: plate * 0.35,
          height: plate,
          borderWidth: STROKE,
          borderColor: color,
          borderRadius: 2,
        }}
      />
    </View>
  );
}

function ForkIcon({ size, color }: IconProps) {
  const w = size * 0.7;
  const h = size;
  return (
    <View style={{ width: w, height: h, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: w * 0.2 + i * (w * 0.22),
            width: STROKE,
            height: h * 0.55,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: w,
          height: STROKE,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

function BarsIcon({ size, color }: IconProps) {
  const w = size;
  const h = size * 0.9;
  const heights = [0.35, 0.55, 0.75, 0.5];
  return (
    <View
      style={{
        width: w,
        height: h,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 2,
      }}>
      {heights.map((ratio, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: h * ratio,
            backgroundColor: color,
            borderRadius: 2,
            opacity: i === 3 ? 0.45 : 0.85,
          }}
        />
      ))}
    </View>
  );
}
