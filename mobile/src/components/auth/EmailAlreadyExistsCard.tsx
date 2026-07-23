import React from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '../ui';

type Props = {
  email: string;
  onSignIn: () => void;
  onResetPassword: () => void;
};

export function EmailAlreadyExistsCard({
  email,
  onSignIn,
  onResetPassword,
}: Props) {
  return (
    <View className="mb-4 rounded-2xl border border-sage/50 bg-white/90 p-4">
      <Text className="font-sans-medium text-base text-ink">
        An account already exists with this email.
      </Text>
      <Text className="mt-1 font-sans text-sm text-slate">{email}</Text>
      <View className="mt-4 gap-2">
        <PrimaryButton label="Sign in" onPress={onSignIn} />
        <SecondaryButton label="Reset password" onPress={onResetPassword} />
      </View>
    </View>
  );
}
