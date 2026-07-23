import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from './Button';

type EmptyStateProps = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  children?: ReactNode;
};

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  children,
}: EmptyStateProps) {
  return (
    <View className="items-start py-6">
      <Text className="font-display text-3xl tracking-tight text-ink">
        {title}
      </Text>
      <Text className="mt-2 max-w-[320px] font-sans text-base leading-6 text-slate">
        {subtitle}
      </Text>
      {children}
      {actionLabel && onAction ? (
        <PrimaryButton
          className="mt-8 w-full"
          label={actionLabel}
          onPress={onAction}
        />
      ) : null}
      {secondaryLabel && onSecondary ? (
        <SecondaryButton
          className="mt-3 w-full"
          label={secondaryLabel}
          onPress={onSecondary}
        />
      ) : null}
    </View>
  );
}

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <View className="mb-4 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3">
      <Text className="font-sans text-sm text-coral">{message}</Text>
      {onRetry ? (
        <Text
          onPress={onRetry}
          className="mt-2 font-sans-semibold text-sm text-ink">
          Try again
        </Text>
      ) : null}
    </View>
  );
}
