export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  percent: number;
};

export function measurePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: 'Too weak', percent: 0 };
  }

  let score = 0;
  if (password.length >= 8) {
    score += 1;
  }
  if (password.length >= 12) {
    score += 1;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }
  if (/\d/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  const clamped = Math.min(4, Math.max(0, score)) as PasswordStrength['score'];
  const labels: PasswordStrength['label'][] = [
    'Too weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
  ];
  return {
    score: clamped,
    label: labels[clamped],
    percent: (clamped / 4) * 100,
  };
}
