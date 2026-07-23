import { layout } from '../theme/tokens';

const TAB_BAR_SAFE_PAD_MIN = 10;

/** Matches `GlossTabBar` footprint: bar + bottom safe pad + float gap. */
export function getTabBarOverlayHeight(safeAreaBottom: number): number {
  return (
    layout.tabBarHeight +
    Math.max(safeAreaBottom, TAB_BAR_SAFE_PAD_MIN) +
    layout.tabBarFloatOffset
  );
}

/** Extra tail padding inside tab ScrollViews (above Screen inset). */
export const TAB_SCROLL_CONTENT_EXTRA = 16;
