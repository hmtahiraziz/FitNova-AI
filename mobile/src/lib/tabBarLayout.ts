import { layout } from '../theme/tokens';

/** Extra float gap above the home indicator / screen bottom edge. */
export const TAB_BAR_BOTTOM_GAP = 8;

/** Horizontal inset so the pill never touches screen edges. */
export const TAB_BAR_SIDE_GAP = layout.tabBarFloatOffset;

/** Matches `GlossTabBar` footprint: bar + safe area + float gap. */
export function getTabBarOverlayHeight(safeAreaBottom: number): number {
  return layout.tabBarHeight + safeAreaBottom + TAB_BAR_BOTTOM_GAP;
}

/** Extra tail padding inside tab ScrollViews (above Screen inset). */
export const TAB_SCROLL_CONTENT_EXTRA = 16;
