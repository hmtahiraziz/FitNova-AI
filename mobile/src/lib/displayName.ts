import type { Profile } from '../api/profile';
import type { AuthUser } from '../api/auth';

function titleCaseWord(word: string): string {
  if (!word) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Friendly name from email local-part when no display name is set. */
export function nameFromEmail(email: string | undefined | null): string {
  if (!email) {
    return 'Athlete';
  }
  const local = email.split('@')[0] ?? '';
  const chunk = local.split(/[._-]+/)[0] ?? local;
  const cleaned = chunk.replace(/\d+$/, '').trim();
  if (cleaned.length >= 2) {
    return titleCaseWord(cleaned);
  }
  return titleCaseWord(local.slice(0, 12)) || 'Athlete';
}

export function getDisplayName(
  profile: Pick<Profile, 'displayName'> | null | undefined,
  user: Pick<AuthUser, 'email'> | null | undefined,
): string {
  const trimmed = profile?.displayName?.trim();
  if (trimmed) {
    return trimmed;
  }
  return nameFromEmail(user?.email);
}

export function getInitial(name: string): string {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : 'F';
}
