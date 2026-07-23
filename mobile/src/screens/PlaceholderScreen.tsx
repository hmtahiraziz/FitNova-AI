import React from 'react';
import { Text, View } from 'react-native';
import {
  PrimaryButton,
  Screen,
  SectionTitle,
} from '../components/ui';

export function PlaceholderScreen({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Screen>
      <SectionTitle title={title} subtitle={subtitle} />
      <View className="mt-6">
        <Text className="font-sans text-slate">
          This screen will be wired in a later phase.
        </Text>
      </View>
      {actionLabel && onAction ? (
        <View className="mt-8">
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </Screen>
  );
}
