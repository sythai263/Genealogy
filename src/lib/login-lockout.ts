const LOCKOUT_STEPS = [
  { failsRequired: 5, lockSec: 30 },
  { failsRequired: 8, lockSec: 120 },
  { failsRequired: 12, lockSec: 300 },
] as const;

export function getLoginLockoutSec(failCount: number): number {
  let sec = 0;
  for (const step of LOCKOUT_STEPS) {
    if (failCount >= step.failsRequired) {
      sec = step.lockSec;
    }
  }
  return sec;
}
