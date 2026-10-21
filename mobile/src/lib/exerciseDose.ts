/**
 * Formats sets + prescription for workout UI.
 * Timed work ("20-30 min", "40 sec") must not append "reps".
 */

const TIMED_RE =
  /\b(sec|secs|second|seconds|min|mins|minute|minutes)\b|\d+\s*[-–]\s*\d+\s*(s|m)\b|^\d+\s*(s|m|sec|min)s?\b/i;

export function isTimedPrescription(reps: string): boolean {
  return TIMED_RE.test(reps.trim());
}

/** Compact badge, e.g. "3 × 8-12" or "3 × 20-30 min". */
export function formatExerciseBadge(sets: number, reps: string): string {
  return `${sets} × ${reps.trim()}`;
}

/** Readable dose line under the exercise name. */
export function formatExerciseDoseLine(sets: number, reps: string): string {
  const setLabel = sets === 1 ? '1 set' : `${sets} sets`;
  const prescription = reps.trim();
  if (!prescription) {
    return setLabel;
  }
  if (isTimedPrescription(prescription) || /\breps?\b/i.test(prescription)) {
    return `${setLabel} · ${prescription}`;
  }
  return `${setLabel} · ${prescription} reps`;
}
