/**
 * Pulse Forge design tokens — JS mirrors of Tailwind theme for Reanimated/charts.
 */
export const colors = {
  ink: '#0B1F1A',
  mist: '#E8F2EE',
  mistLight: '#F4F7F5',
  sage: '#A8C5B8',
  mint: '#2EE6A6',
  coral: '#FF5B45',
  slate: '#4A5C56',
  glass: 'rgba(244, 247, 245, 0.88)',
  glassBorder: 'rgba(11, 31, 26, 0.08)',
} as const;

export const fonts = {
  display: 'Syne-Bold',
  displayExtraBold: 'Syne-ExtraBold',
  sans: 'Manrope-Regular',
  sansMedium: 'Manrope-Medium',
  sansSemiBold: 'Manrope-SemiBold',
} as const;

/** Syne needs explicit line heights to avoid glyph overlap on Android. */
export function displayTitleStyle(compact: boolean) {
  return {
    fontFamily: fonts.display,
    fontSize: compact ? 26 : 30,
    lineHeight: compact ? 36 : 42,
    color: colors.ink,
  } as const;
}

export function displayCardStyle(compact: boolean) {
  return {
    fontFamily: fonts.display,
    fontSize: compact ? 22 : 26,
    lineHeight: compact ? 30 : 34,
    color: colors.ink,
  } as const;
}

export const mistGradient = {
  colors: [colors.mist, colors.mistLight] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

export const layout = {
  tabBarHeight: 64,
  tabBarFloatOffset: 12,
  /** Legacy constant; prefer getTabBarOverlayHeight() in lib/tabBarLayout.ts */
  tabBarContentInset: 88,
  maxContentWidth: 560,
} as const;

export const brand = {
  name: 'FitNova',
  ai: 'AI',
  fullName: 'FitNova AI',
  product: 'FitNova AI',
} as const;
