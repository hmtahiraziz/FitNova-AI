import React from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { HeaderTitle } from './HeaderTitle';

type TabScreenHeaderProps = ViewProps & {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  trailing?: React.ReactNode;
  /** @deprecated Always descender-safe. Kept for call-site compatibility. */
  titleDescenderSafe?: boolean;
};

/** Tab screen title — Manrope HeaderTitle (no clipped g/y). */
export function TabScreenHeader({
  title,
  subtitle,
  footer,
  trailing,
  className = '',
  titleDescenderSafe: _titleDescenderSafe,
  ...props
}: TabScreenHeaderProps) {
  return (
    <View
      className={`mb-5 w-full ${className}`}
      style={{ overflow: 'visible' }}
      {...props}>
      <View className="w-full flex-row items-start justify-between gap-3">
        <View className="flex-1" style={{ overflow: 'visible', minWidth: 0 }}>
          <HeaderTitle>{title}</HeaderTitle>
          {subtitle ? (
            <Text
              className="mt-1.5 font-sans text-base leading-6 text-slate"
              numberOfLines={4}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing ? <View className="shrink-0 pt-1">{trailing}</View> : null}
      </View>
      {footer}
    </View>
  );
}
