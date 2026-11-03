import React, { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { HeaderTitle } from './HeaderTitle';

type SoftCardHeaderProps = {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  onBack?: () => void;
  backLabel?: string;
  footer?: ReactNode;
  className?: string;
};

/** Clear minimal auth / onboarding header — Manrope HeaderTitle. */
export function SoftCardHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  footer,
  className = '',
}: SoftCardHeaderProps) {
  return (
    <View className={`mb-7 min-w-0 ${className}`} style={{ overflow: 'visible' }}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={onBack}
          hitSlop={14}
          className="mb-5 self-start">
          <Text className="font-sans-medium text-[15px] text-slate">
            ← {backLabel}
          </Text>
        </Pressable>
      ) : null}

      <HeaderTitle>{title}</HeaderTitle>

      {subtitle ? (
        <Text
          className="mt-1 max-w-[34rem] font-sans text-[15px] leading-6 text-slate"
          numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}

      {footer ? <View className="mt-5">{footer}</View> : null}
    </View>
  );
}

type SoftProgressFooterProps = {
  step: number;
  total: number;
  label?: string;
};

export function SoftProgressFooter({
  step,
  total,
  label,
}: SoftProgressFooterProps) {
  const pct = Math.max(0, Math.min(100, ((step + 1) / total) * 100));
  return (
    <View>
      <Text className="mb-2 font-sans-medium text-xs tracking-wide text-slate">
        {label ?? `${step + 1} / ${total}`}
      </Text>
      <View className="h-1 w-full overflow-hidden rounded-full bg-ink/8">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: colors.ink }}
        />
      </View>
    </View>
  );
}
