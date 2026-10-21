import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import {
  launchImageLibrary,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { ApiError } from '../../api/client';
import { useProfileAvatarUri } from '../../hooks/useProfileAvatarUri';
import { getInitial } from '../../lib/displayName';
import { requireOnline } from '../../lib/offline';
import { showDialog } from '../../store/dialogStore';
import { useProfileStore } from '../../store/profileStore';
import { colors } from '../../theme/tokens';
import { AvatarFace } from '../ui/AvatarFace';

/** Uses the system photo picker on modern Android (no broad storage permission). */
const PICKER_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  includeBase64: false,
  includeExtra: false,
  restrictMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
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
  const { uri: displayUri, loading: imageLoading } = useProfileAvatarUri(
    avatarUrl,
    cacheKey,
  );
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setImageBroken(false);
  }, [avatarUrl, cacheKey]);

  const initial = getInitial(displayName);
  const hasAvatar = Boolean(avatarUrl?.trim());
  const showUri = imageBroken ? null : displayUri;

  const pickPhoto = useCallback(async () => {
    if (!requireOnline('Connect to upload a profile photo.')) {
      return;
    }
    setLocalError(null);
    const result = await launchImageLibrary(PICKER_OPTIONS);
    if (result.didCancel || !result.assets?.[0]?.uri) {
      return;
    }
    const asset = result.assets[0];
    setBusy(true);
    try {
      setImageBroken(false);
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

  const runRemove = useCallback(() => {
    void (async () => {
      if (!requireOnline('Connect to remove your profile photo.')) {
        return;
      }
      setBusy(true);
      setLocalError(null);
      try {
        await removeAvatar();
        setImageBroken(false);
      } catch (err) {
        setLocalError(
          err instanceof ApiError ? err.message : 'Could not remove photo',
        );
      } finally {
        setBusy(false);
      }
    })();
  }, [removeAvatar]);

  const confirmRemove = useCallback(() => {
    showDialog({
      title: 'Remove photo?',
      message: 'Your profile will show your initial again.',
      actions: [
        {
          label: 'Remove',
          variant: 'destructive',
          onPress: runRemove,
        },
        { label: 'Cancel', variant: 'secondary' },
      ],
    });
  }, [runRemove]);

  const openMenu = useCallback(() => {
    if (busy) {
      return;
    }
    if (!hasAvatar) {
      showDialog({
        title: 'Profile photo',
        message: 'Add a photo from your library.',
        actions: [
          {
            label: 'Choose photo',
            variant: 'primary',
            onPress: () => void pickPhoto(),
          },
          { label: 'Cancel', variant: 'secondary' },
        ],
      });
      return;
    }
    showDialog({
      title: 'Profile photo',
      message: 'Update or remove your picture.',
      actions: [
        {
          label: 'Change photo',
          variant: 'primary',
          onPress: () => void pickPhoto(),
        },
        {
          label: 'Remove photo',
          variant: 'destructive',
          onPress: confirmRemove,
        },
        { label: 'Cancel', variant: 'secondary' },
      ],
    });
  }, [busy, confirmRemove, hasAvatar, pickPhoto]);

  // Extra pad so the edit badge sits inside the hit box without clipping.
  const badgeSize = Math.max(26, Math.round(size * 0.28));
  const badgePad = Math.ceil(badgeSize * 0.35);
  const frameSize = size + badgePad * 2;

  const avatarCircle = (
    <View
      style={{
        width: frameSize,
        height: frameSize,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}>
      <AvatarFace
        displayNameInitial={initial}
        uri={showUri}
        size={size}
        loading={hasAvatar && imageLoading}
        bordered
        accessibilityLabel={`${displayName} profile photo`}
        onImageError={() => setImageBroken(true)}
      />
      {busy ? (
        <View
          className="absolute items-center justify-center rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: 'rgba(11, 31, 26, 0.45)',
          }}>
          <ActivityIndicator color={colors.mint} />
        </View>
      ) : null}
      {showEditBadge && !busy ? (
        <View
          className="absolute items-center justify-center rounded-full border-2 border-mist bg-ink"
          style={{
            width: badgeSize,
            height: badgeSize,
            right: 0,
            bottom: 0,
          }}>
          <Text
            className="font-sans-semibold text-mint"
            style={{ fontSize: badgeSize * 0.42, lineHeight: badgeSize * 0.5 }}>
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
          style={{ overflow: 'visible' }}
          className="flex-row items-center gap-3 py-1">
          {avatarCircle}
          <View className="min-w-0 flex-1 shrink">
            <Text className="font-sans-semibold text-base text-ink">
              Profile photo
            </Text>
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
    <View className="items-center" style={{ overflow: 'visible' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
        onPress={openMenu}
        disabled={busy}
        style={{ overflow: 'visible' }}>
        {avatarCircle}
      </Pressable>
      {showHint ? (
        <Text className="mt-1 font-sans text-sm text-slate">
          Tap photo to update
        </Text>
      ) : null}
      {localError ? (
        <Text className="mt-2 text-center font-sans text-sm text-coral">
          {localError}
        </Text>
      ) : null}
    </View>
  );
}
