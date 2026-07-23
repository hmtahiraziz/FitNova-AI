import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppLogo } from '../brand/AppLogo';
import { colors } from '../../theme/tokens';

type HomeTopBarProps = {
  profileInitial: string;
  onProfilePress: () => void;
};

/** Minimal home header — brand row + profile, Apple Fitness–style spacing. */
export function HomeTopBar({ profileInitial, onProfilePress }: HomeTopBarProps) {
  return (
    <View
      className="w-full flex-row items-center justify-between"
      style={{
        paddingHorizontal: 4,
        paddingVertical: 8,
        minHeight: 56,
        gap: 20,
      }}>
      <AppLogo variant="homeBar" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={onProfilePress}
        className="h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-ink"
        style={{ borderColor: `${colors.mint}55` }}>
        <Text className="font-sans-semibold text-sm uppercase text-mist">
          {profileInitial}
        </Text>
      </Pressable>
    </View>
  );
}
