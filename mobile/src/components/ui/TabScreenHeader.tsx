import React from 'react';
import { Platform, Text, View, type ViewProps } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { displayTitleStyle } from '../../theme/tokens';

type TabScreenHeaderProps = ViewProps & {
  title: string;
  subtitle?: string;
  /** Extra content below subtitle (e.g. date line) */
  footer?: React.ReactNode;
  /** Top-right actions (e.g. History pill) */
  trailing?: React.ReactNode;
  /** Avoid Syne descender clip (e.g. “Progress”) on Android. */
  titleDescenderSafe?: boolean;
};

/** Consistent tab screen title — Syne with safe line heights (no glyph clip). */
export function TabScreenHeader({
  title,
  subtitle,
  footer,
  trailing,
  className = '',
  titleDescenderSafe = false,
  ...props
}: TabScreenHeaderProps) {
  const { isCompact } = useResponsive();
  const base = displayTitleStyle(isCompact);
  const safeLineBox = base.fontSize + 26;

  const titleStyle = titleDescenderSafe
    ? {
        fontFamily: base.fontFamily,
        fontSize: base.fontSize,
        color: base.color,
        lineHeight: safeLineBox,
        ...(Platform.OS === 'android'
          ? {
              includeFontPadding: true as const,
              textAlignVertical: 'top' as const,
            }
          : {}),
      }
    : base;

  const titleEl = (
    <Text
      style={titleStyle}
      className={titleDescenderSafe ? undefined : 'min-w-0'}
      accessibilityRole="header"
      numberOfLines={titleDescenderSafe ? undefined : 2}
      adjustsFontSizeToFit={!titleDescenderSafe}
      minimumFontScale={titleDescenderSafe ? undefined : 0.75}>
      {title}
    </Text>
  );

  return (
    <View className={`mb-5 min-w-0 ${className}`} {...props}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          {titleDescenderSafe ? (
            <View
              style={{
                overflow: 'visible',
                minHeight: safeLineBox,
                marginBottom: 12,
              }}>
              {titleEl}
            </View>
          ) : (
            titleEl
          )}
          {subtitle ? (
            <Text
              className={`min-w-0 font-sans text-base leading-6 text-slate ${
                titleDescenderSafe ? '' : 'mt-2'
              }`}
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
