import { useEffect, useState } from 'react';

const RESEND_COOLDOWN_SEC = 60;

export function resendLockedUntilNow(
  seconds = RESEND_COOLDOWN_SEC,
): number {
  return Date.now() + seconds * 1000;
}

export function useResendCooldown(lockedUntilMs?: number) {
  const [lockedUntil, setLockedUntil] = useState(
    lockedUntilMs ?? resendLockedUntilNow(),
  );

  useEffect(() => {
    if (lockedUntilMs != null) {
      setLockedUntil(lockedUntilMs);
    }
  }, [lockedUntilMs]);

  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)),
  );

  useEffect(() => {
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const canResend = secondsLeft <= 0;

  const startCooldown = (seconds = RESEND_COOLDOWN_SEC) => {
    setLockedUntil(Date.now() + seconds * 1000);
  };

  return { secondsLeft, canResend, startCooldown };
}
