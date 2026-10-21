import { showToast } from '../store/toastStore';

/** Module flag kept in sync by `useNetworkStatus` for non-React callers. */
let offline = false;

export function setOfflineFlag(value: boolean) {
  offline = value;
}

export function getIsOffline(): boolean {
  return offline;
}

/**
 * Returns true when online. When offline, shows a toast and returns false.
 */
export function requireOnline(
  message = 'Connect to the internet to continue.',
): boolean {
  if (!offline) {
    return true;
  }
  showToast(message, 'error');
  return false;
}
