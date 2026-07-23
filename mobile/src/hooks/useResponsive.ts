import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'sm' | 'md' | 'lg';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const breakpoint: Breakpoint =
    width >= 768 ? 'lg' : width >= 400 ? 'md' : 'sm';

  return {
    width,
    height,
    breakpoint,
    isCompact: breakpoint === 'sm',
    isTablet: breakpoint === 'lg',
    contentPad: breakpoint === 'lg' ? 28 : 22,
  };
}
