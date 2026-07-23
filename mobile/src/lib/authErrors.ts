import { ApiError } from '../api/client';

export function isEmailAlreadyRegistered(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

export function getRegisterErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return 'An account already exists with this email.';
    }
    return err.message;
  }
  return 'Could not create account. Please try again.';
}
