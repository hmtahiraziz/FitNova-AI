import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';

type AvatarFaceProps = {
  displayNameInitial: string;
  uri: string | null;
  size: number;
  loading?: boolean;
  /** Soft ring for header / chrome (default true). */
  bordered?: boolean;
  accessibilityLabel?: string;
  onImageError?: () => void;
};

/** Circular photo or initial — shared by Home header and Profile. */
export function AvatarFace({
  displayNameInitial,
  uri,
  size,
  loading = false,
  bordered = true,
  accessibilityLabel,
  onImageError,
}: AvatarFaceProps) {
  const showPhoto = Boolean(uri);

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-ink"
      style={{
        width: size,
        height: size,
        borderWidth: bordered ? 2 : 0,
        borderColor: bordered ? `${colors.mint}55` : 'transparent',
      }}>
      {showPhoto ? (
        <Image
          source={{ uri: uri! }}
          accessibilityLabel={accessibilityLabel}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={onImageError}
        />
      ) : (
        <Text
          className="font-sans-semibold uppercase text-mist"
          style={{ fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * 0.42) }}>
          {displayNameInitial}
        </Text>
      )}
      {loading && !showPhoto ? (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: 'rgba(11, 31, 26, 0.45)' }}>
          <ActivityIndicator color={colors.mint} size="small" />
        </View>
      ) : null}
    </View>
  );
}
