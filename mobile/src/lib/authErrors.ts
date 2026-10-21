import { ApiError } from '../api/client';

export const ACCOUNT_EXISTS_MESSAGE =
  'An account already exists with this email. Sign in instead.';

export function isEmailAlreadyRegistered(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

export function getRegisterErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return ACCOUNT_EXISTS_MESSAGE;
    }
    return err.message;
  }
  return 'Could not create account. Please try again.';
}
