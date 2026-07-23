import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { brand, colors, fonts } from '../../theme/tokens';

type AppLogoProps = {
  variant?: 'hero' | 'header' | 'compact' | 'homeBar';
  style?: ViewStyle;
};

/** Original FitNova mark — ink tile, mint core, mist highlight. */
function LogoMark({ size }: { size: number }) {
  const inner = size * 0.42;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: colors.mint,
          opacity: 0.95,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: inner * 0.35,
          height: inner * 0.35,
          borderRadius: 999,
          backgroundColor: colors.mist,
          top: size * 0.22,
          right: size * 0.2,
        }}
      />
    </View>
  );
}

function WordmarkRow({ size }: { size: 'lg' | 'sm' }) {
  const mainSize = size === 'lg' ? 36 : 20;
  const tagSize = size === 'lg' ? 11 : 10;

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <Text
        style={{
          fontFamily: fonts.displayExtraBold,
          fontSize: mainSize,
          color: colors.ink,
          letterSpacing: -0.5,
        }}>
        {brand.name}
      </Text>
      <View
        style={{
          paddingHorizontal: size === 'lg' ? 8 : 6,
          paddingVertical: size === 'lg' ? 3 : 2,
          borderRadius: 999,
          backgroundColor: `${colors.mint}33`,
          borderWidth: 1,
          borderColor: `${colors.mint}66`,
        }}>
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: tagSize,
            color: colors.ink,
            letterSpacing: 0.6,
          }}>
          {brand.ai}
        </Text>
      </View>
    </View>
  );
}

export function AppLogo({ variant = 'header', style }: AppLogoProps) {
  if (variant === 'homeBar') {
    return (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            minWidth: 0,
            gap: 11,
            paddingVertical: 7,
            paddingHorizontal: 11,
            borderRadius: 18,
            backgroundColor: colors.glass,
            borderWidth: 1,
            borderColor: colors.glassBorder,
          },
          style,
        ]}>
        <LogoMark size={34} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <WordmarkRow size="sm" />
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              lineHeight: 15,
              color: colors.slate,
              marginTop: 2,
            }}>
            Daily coaching
          </Text>
        </View>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
        <LogoMark size={32} />
        <WordmarkRow size="sm" />
      </View>
    );
  }

  if (variant === 'hero') {
    return (
      <View style={[{ alignItems: 'flex-start', gap: 16 }, style]}>
        <LogoMark size={72} />
        <WordmarkRow size="lg" />
      </View>
    );
  }

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>
      <LogoMark size={40} />
      <WordmarkRow size="sm" />
    </View>
  );
}
