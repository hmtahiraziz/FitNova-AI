import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme/tokens';

/** Monoline pulse mark — readable as flat ink shape at 24px+. */
export function PulseLogoMark({ size = 32 }: { size?: number }) {
  const chip = size;
  const line = Math.max(2, Math.round(size * 0.08));
  const trackW = size * 0.58;
  const trackH = size * 0.34;

  return (
    <View
      style={{
        width: chip,
        height: chip,
        borderRadius: chip * 0.24,
        backgroundColor: colors.mist,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: trackW,
          height: trackH,
          justifyContent: 'center',
        }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: trackH * 0.52,
            width: trackW * 0.22,
            height: line,
            borderRadius: line,
            backgroundColor: colors.ink,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: trackW * 0.18,
            top: trackH * 0.28,
            width: trackW * 0.2,
            height: line,
            borderRadius: line,
            backgroundColor: colors.mint,
            transform: [{ rotate: '-42deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: trackW * 0.34,
            top: trackH * 0.08,
            width: trackW * 0.18,
            height: line,
            borderRadius: line,
            backgroundColor: colors.mint,
            transform: [{ rotate: '48deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: trackW * 0.48,
            top: trackH * 0.42,
            width: trackW * 0.22,
            height: line,
            borderRadius: line,
            backgroundColor: colors.ink,
            transform: [{ rotate: '-38deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: trackH * 0.5,
            width: trackW * 0.24,
            height: line,
            borderRadius: line,
            backgroundColor: colors.ink,
          }}
        />
      </View>
    </View>
  );
}
