import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  launchImageLibrary,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { ApiError } from '../../api/client';
import { getInitial } from '../../lib/displayName';
import { resolveAvatarUrl } from '../../lib/resolveAvatarUrl';
import { useProfileStore } from '../../store/profileStore';
import { colors } from '../../theme/tokens';

const PICKER_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  includeBase64: false,
};

type ProfileAvatarProps = {
  displayName: string;
  avatarUrl: string | null | undefined;
  cacheKey?: string | number;
  size?: number;
  showEditBadge?: boolean;
  showHint?: boolean;
  layout?: 'center' | 'row';
  subtitle?: string;
};

export function ProfileAvatar({
  displayName,
  avatarUrl,
  cacheKey,
  size = 88,
  showEditBadge = true,
  showHint = false,
  layout = 'center',
  subtitle,
}: ProfileAvatarProps) {
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const removeAvatar = useProfileStore((s) => s.removeAvatar);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const initial = getInitial(displayName);
  const imageUri = useMemo(
    () => resolveAvatarUrl(avatarUrl, cacheKey),
    [avatarUrl, cacheKey],
  );

  const pickPhoto = useCallback(async () => {
    setLocalError(null);
    const result = await launchImageLibrary(PICKER_OPTIONS);
    if (result.didCancel || !result.assets?.[0]?.uri) {
      return;
    }
    const asset = result.assets[0];
    setBusy(true);
    try {
      await uploadAvatar({
        uri: asset.uri!,
        type: asset.type,
        fileName: asset.fileName,
      });
    } catch (err) {
      setLocalError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }, [uploadAvatar]);

  const confirmRemove = useCallback(() => {
    Alert.alert(
      'Remove photo?',
      'Your profile will show your initial again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              setLocalError(null);
              try {
                await removeAvatar();
              } catch (err) {
                setLocalError(
                  err instanceof ApiError ? err.message : 'Could not remove photo',
                );
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  }, [removeAvatar]);

  const openMenu = useCallback(() => {
    if (busy) {
      return;
    }
    const buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'cancel' | 'destructive' | 'default';
    }> = [
      { text: 'Choose from library', onPress: () => void pickPhoto() },
    ];
    if (imageUri) {
      buttons.push({
        text: 'Remove photo',
        style: 'destructive',
        onPress: confirmRemove,
      });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Profile photo', undefined, buttons);
  }, [busy, confirmRemove, imageUri, pickPhoto]);

  const ringSize = size + 8;
  const badgeSize = Math.max(28, Math.round(size * 0.32));

  const avatarCircle = (
    <View style={{ width: ringSize, height: ringSize }} className="items-center justify-center">
      <View
        className="items-center justify-center overflow-hidden rounded-full border-2 border-mint/70 bg-ink"
        style={{ width: size, height: size }}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            accessibilityLabel={`${displayName} profile photo`}
            style={{ width: size, height: size }}
            resizeMode="cover"
          />
        ) : (
          <Text
            className="font-display text-mist"
            style={{ fontSize: size * 0.38 }}>
            {initial}
          </Text>
        )}
        {busy ? (
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: 'rgba(11, 31, 26, 0.45)' }}>
            <ActivityIndicator color={colors.mint} />
          </View>
        ) : null}
      </View>
      {showEditBadge && !busy ? (
        <View
          className="absolute bottom-0 right-0 items-center justify-center rounded-full border-2 border-mist bg-ink"
          style={{ width: badgeSize, height: badgeSize }}>
          <Text className="font-sans-semibold text-mint" style={{ fontSize: badgeSize * 0.45 }}>
            ✎
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (layout === 'row') {
    return (
      <View className="min-w-0">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={openMenu}
          disabled={busy}
          className="flex-row items-center gap-4 rounded-2xl bg-mist/80 px-3 py-3">
          {avatarCircle}
          <View className="min-w-0 flex-1 shrink">
            <Text className="font-sans-semibold text-base text-ink">Profile photo</Text>
            <Text className="mt-0.5 font-sans text-sm leading-5 text-slate">
              {subtitle ?? 'Tap to upload or change your picture'}
            </Text>
          </View>
        </Pressable>
        {localError ? (
          <Text className="mt-2 font-sans text-sm text-coral">{localError}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
        onPress={openMenu}
        disabled={busy}>
        {avatarCircle}
      </Pressable>
      {showHint ? (
        <Text className="mt-3 font-sans text-sm text-slate">Tap photo to update</Text>
      ) : null}
      {localError ? (
        <Text className="mt-2 text-center font-sans text-sm text-coral">{localError}</Text>
      ) : null}
    </View>
  );
}
