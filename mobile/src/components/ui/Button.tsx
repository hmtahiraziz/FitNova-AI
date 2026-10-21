import React from 'react';
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type TextProps,
} from 'react-native';
import { HeaderTitle } from './HeaderTitle';

type PrimaryButtonProps = PressableProps & {
  label: string;
  className?: string;
  labelClassName?: string;
};

export function PrimaryButton({
  label,
  className = '',
  labelClassName = '',
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`rounded-xl bg-ink px-6 py-4 ${disabled ? 'opacity-50' : ''} ${className}`}
      style={({ pressed }) =>
        !disabled && pressed ? { opacity: 0.88 } : undefined
      }
      {...props}>
      <Text
        className={`text-center font-sans-semibold text-base text-mist ${labelClassName}`}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}>
        {label}
      </Text>
      <View className="mt-2 h-0.5 w-8 self-center bg-mint opacity-80" />
    </Pressable>
  );
}

type SecondaryButtonProps = PressableProps & {
  label: string;
  className?: string;
  labelClassName?: string;
};

export function SecondaryButton({
  label,
  className = '',
  labelClassName = '',
  disabled,
  ...props
}: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`rounded-xl border border-ink/20 bg-transparent px-6 py-4 ${disabled ? 'opacity-50' : ''} ${className}`}
      style={({ pressed }) =>
        !disabled && pressed ? { opacity: 0.72 } : undefined
      }
      {...props}>
      <Text
        className={`text-center font-sans-semibold text-base text-ink ${labelClassName}`}>
        {label}
      </Text>
    </Pressable>
  );
}

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
  titleProps?: TextProps;
};

export function SectionTitle({
  title,
  subtitle,
  className = '',
  titleProps,
}: SectionTitleProps) {
  return (
    <View
      className={`mb-4 min-w-0 ${className}`}
      style={{ overflow: 'visible' }}>
      <HeaderTitle style={titleProps?.style}>{title}</HeaderTitle>
      {subtitle ? (
        <Text className="mt-2 min-w-0 font-sans text-base leading-6 text-slate">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

type ChipProps = PressableProps & {
  label: string;
  selected?: boolean;
  className?: string;
  /** Fully rounded chips (height/2 radius). */
  pill?: boolean;
};

export function Chip({
  label,
  selected = false,
  className = '',
  pill = false,
  ...props
}: ChipProps) {
  const radius = pill ? 'rounded-full' : 'rounded-lg';
  const unselectedBorder = pill ? 'border border-ink/20' : 'border border-sage';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`${radius} px-3 py-2.5 ${
        selected ? 'bg-mint' : `${unselectedBorder} bg-transparent`
      } ${className}`}
      {...props}>
      <Text
        className={`text-center font-sans-medium text-sm leading-5 ${
          selected ? 'text-ink' : pill ? 'text-ink' : 'text-slate'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}
