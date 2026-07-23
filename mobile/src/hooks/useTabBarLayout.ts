import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TAB_SCROLL_CONTENT_EXTRA,
  getTabBarOverlayHeight,
} from '../lib/tabBarLayout';

export function useTabBarLayout() {
  const insets = useSafeAreaInsets();
  const overlayHeight = getTabBarOverlayHeight(insets.bottom);
  return {
    overlayHeight,
    scrollContentPaddingBottom: TAB_SCROLL_CONTENT_EXTRA,
  };
}
