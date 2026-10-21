/** Soft throttle for tab focus refetches — keeps switches instant. */
export const TAB_FOCUS_FETCH_TTL_MS = 30_000;

type FocusFetchGate = {
  /** True if a background refresh should run now. */
  tryAcquire: () => boolean;
  /** Mark a refresh as done (e.g. after pull-to-refresh). */
  mark: () => void;
};

/**
 * Allows a background refresh at most once per TTL.
 * First tryAcquire always passes.
 */
export function createFocusFetchGate(
  ttlMs = TAB_FOCUS_FETCH_TTL_MS,
): FocusFetchGate {
  let lastMs = 0;
  return {
    tryAcquire: () => {
      const now = Date.now();
      if (lastMs !== 0 && now - lastMs < ttlMs) {
        return false;
      }
      lastMs = now;
      return true;
    },
    mark: () => {
      lastMs = Date.now();
    },
  };
}
