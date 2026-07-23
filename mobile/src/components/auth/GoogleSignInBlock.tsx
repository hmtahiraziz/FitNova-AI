import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '../ui';
import { colors } from '../../theme/tokens';

type Props = {
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function GoogleSignInBlock({ loading, disabled, onPress }: Props) {
  return (
    <>
      <View className="my-5 flex-row items-center gap-3">
        <View className="h-px flex-1 bg-sage/60" />
        <Text className="font-sans text-xs text-slate">or</Text>
        <View className="h-px flex-1 bg-sage/60" />
      </View>
      <SecondaryButton
        label={loading ? 'Connecting…' : 'Continue with Google'}
        onPress={onPress}
        disabled={disabled || loading}
      />
      {loading ? (
        <ActivityIndicator className="mt-4" color={colors.mint} />
      ) : null}
    </>
  );
}
