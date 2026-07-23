/** Calendar-date helpers (YYYY-MM-DD) stored as UTC midnight. */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnlyString(value: string): boolean {
  if (!DATE_RE.test(value)) {
    return false;
  }
  const parsed = parseDateOnly(value);
  return formatDateOnly(parsed) === value;
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayUtcDateOnly(): string {
  return formatDateOnly(new Date());
}

export function addDays(dateOnly: string, days: number): string {
  const date = parseDateOnly(dateOnly);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateOnly(date);
}

export function daysBetween(from: string, to: string): number {
  const a = parseDateOnly(from).getTime();
  const b = parseDateOnly(to).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}
