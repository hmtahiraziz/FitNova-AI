import React, { type ReactNode } from 'react';
import { Platform, Text, View } from 'react-native';
import { colors, fonts } from '../../theme/tokens';
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

/**
 * Empty states use Manrope so titles like “No logs yet” never clip,
 * and stay secondary to the screen HeaderTitle.
 */
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
    <View className="items-start py-6" style={{ overflow: 'visible' }}>
      <Text
        accessibilityRole="header"
        numberOfLines={2}
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 20,
          lineHeight: 28,
          letterSpacing: -0.2,
          color: colors.ink,
          ...(Platform.OS === 'android'
            ? {
                includeFontPadding: true,
                textAlignVertical: 'center' as const,
                paddingBottom: 2,
              }
            : { paddingBottom: 1 }),
        }}>
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
