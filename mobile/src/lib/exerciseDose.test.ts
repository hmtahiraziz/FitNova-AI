import {
  formatExerciseBadge,
  formatExerciseDoseLine,
  isTimedPrescription,
} from './exerciseDose';

describe('exerciseDose', () => {
  it('detects timed prescriptions', () => {
    expect(isTimedPrescription('20-30 min')).toBe(true);
    expect(isTimedPrescription('40 sec')).toBe(true);
    expect(isTimedPrescription('8-12')).toBe(false);
    expect(isTimedPrescription('AMRAP')).toBe(false);
  });

  it('formats badge without forcing reps', () => {
    expect(formatExerciseBadge(3, '8-12')).toBe('3 × 8-12');
    expect(formatExerciseBadge(3, '20-30 min')).toBe('3 × 20-30 min');
  });

  it('appends reps only for rep-based work', () => {
    expect(formatExerciseDoseLine(3, '8-12')).toBe('3 sets · 8-12 reps');
    expect(formatExerciseDoseLine(1, '10')).toBe('1 set · 10 reps');
    expect(formatExerciseDoseLine(3, '20-30 min')).toBe('3 sets · 20-30 min');
    expect(formatExerciseDoseLine(2, '40 sec')).toBe('2 sets · 40 sec');
    expect(formatExerciseDoseLine(3, '12 reps')).toBe('3 sets · 12 reps');
  });
});
