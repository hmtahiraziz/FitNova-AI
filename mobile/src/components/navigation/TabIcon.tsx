import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme/tokens';

type TabIconName = 'home' | 'plan' | 'log' | 'progress' | 'profile';

type TabIconProps = {
  name: TabIconName;
  focused: boolean;
  size?: number;
  /** Override stroke when parent sets explicit colors (e.g. ink tab bar). */
  color?: string;
};

/** Lightweight geometric icons — no native SVG dependency. */
export function TabIcon({
  name,
  focused,
  size = 22,
  color,
}: TabIconProps) {
  const stroke = color ?? (focused ? colors.ink : colors.slate);
  const fill = focused ? colors.mint : 'transparent';
  const s = size;

  if (name === 'home') {
    return (
      <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'flex-end' }}>
        <View
          style={{
            width: s * 0.85,
            height: s * 0.55,
            borderWidth: 2,
            borderColor: stroke,
            backgroundColor: fill,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: 0,
            height: 0,
            borderLeftWidth: s * 0.42,
            borderRightWidth: s * 0.42,
            borderBottomWidth: s * 0.38,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: stroke,
          }}
        />
      </View>
    );
  }

  if (name === 'plan') {
    return (
      <View
        style={{
          width: s * 0.72,
          height: s,
          borderWidth: 2,
          borderColor: stroke,
          borderRadius: 3,
          backgroundColor: fill,
          padding: 3,
          justifyContent: 'space-evenly',
        }}>
        <View style={{ height: 2, backgroundColor: stroke, borderRadius: 1 }} />
        <View style={{ height: 2, width: '70%', backgroundColor: stroke, borderRadius: 1 }} />
        <View style={{ height: 2, width: '85%', backgroundColor: stroke, borderRadius: 1 }} />
      </View>
    );
  }

  if (name === 'log') {
    return (
      <View
        style={{
          width: s,
          height: s,
          borderRadius: s / 2,
          borderWidth: 2,
          borderColor: stroke,
          backgroundColor: fill,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{ width: 2, height: s * 0.4, backgroundColor: stroke, borderRadius: 1 }} />
        <View
          style={{
            position: 'absolute',
            width: s * 0.35,
            height: 2,
            backgroundColor: stroke,
            borderRadius: 1,
            right: s * 0.18,
            top: s * 0.32,
            transform: [{ rotate: '-40deg' }],
          }}
        />
      </View>
    );
  }

  if (name === 'progress') {
    return (
      <View
        style={{
          width: s,
          height: s,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
        {[0.45, 0.7, 1].map((h, i) => (
          <View
            key={i}
            style={{
              width: s * 0.22,
              height: s * h,
              borderRadius: 3,
              backgroundColor: focused ? colors.mint : colors.sage,
              borderWidth: focused ? 0 : 1.5,
              borderColor: stroke,
            }}
          />
        ))}
      </View>
    );
  }

  // profile
  return (
    <View style={{ width: s, height: s, alignItems: 'center' }}>
      <View
        style={{
          width: s * 0.4,
          height: s * 0.4,
          borderRadius: s * 0.2,
          borderWidth: 2,
          borderColor: stroke,
          backgroundColor: fill,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: s * 0.72,
          height: s * 0.38,
          borderTopLeftRadius: s * 0.36,
          borderTopRightRadius: s * 0.36,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: stroke,
          backgroundColor: fill,
        }}
      />
    </View>
  );
}

export type { TabIconName };
