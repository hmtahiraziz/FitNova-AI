import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useProfileAvatarUri } from '../../hooks/useProfileAvatarUri';
import { AppLogo } from '../brand/AppLogo';
import { AvatarFace } from '../ui/AvatarFace';

type HomeTopBarProps = {
  displayName: string;
  profileInitial: string;
  avatarUrl?: string | null;
  avatarCacheKey?: string | number;
  onProfilePress: () => void;
};

/** Minimal home header — brand row + profile photo, Apple Fitness–style spacing. */
export function HomeTopBar({
  displayName,
  profileInitial,
  avatarUrl,
  avatarCacheKey,
  onProfilePress,
}: HomeTopBarProps) {
  const { uri, loading } = useProfileAvatarUri(avatarUrl, avatarCacheKey);
  const [imageBroken, setImageBroken] = useState(false);
  const size = 44;

  useEffect(() => {
    setImageBroken(false);
  }, [avatarUrl, avatarCacheKey]);

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
        hitSlop={8}
        style={({ pressed }) => ({
          opacity: pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}>
        <AvatarFace
          displayNameInitial={profileInitial}
          uri={imageBroken ? null : uri}
          size={size}
          loading={Boolean(avatarUrl?.trim()) && loading}
          bordered
          accessibilityLabel={`${displayName} profile`}
          onImageError={() => setImageBroken(true)}
        />
      </Pressable>
    </View>
  );
}
