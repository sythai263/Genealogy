/**
 * @project AncestorTree
 * @file src/lib/rate-limit.ts
 * @description In-memory rate limiting for the auth proxy — per-IP window
 *              counters. Module-level Map persists across requests in
 *              self-hosted next start / Docker. In true Edge workers each
 *              isolate is fresh — GoTrue config.toml [auth.rate_limit] is
 *              the primary defense there.
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { NextRequest } from 'next/server';

interface RateEntry { count: number; windowStart: number; }

// Module-level store — persists across requests in self-hosted Next.js (next start / Docker).
// In true Edge workers (Vercel), each isolate is fresh — that's fine; GoTrue handles it there.
const rateLimitStore = new Map<string, RateEntry>();

// Limits: deliberately lenient (operational priority) — stops bots, not impatient humans.
export const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/login':           { max: 20, windowMs: 60_000 },   // 20 page loads/min
  '/register':        { max: 10, windowMs: 60_000 },   // 10 page loads/min
  '/forgot-password': { max:  6, windowMs: 300_000 },  // 6 loads/5 min
  '/reset-password':  { max: 10, windowMs: 60_000 },   // 10 page loads/min
  '/register-member': { max:  3, windowMs: 3_600_000 }, // 3 submissions/hour (anti-spam)
};

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

export function checkRateLimit(ip: string, pathname: string): { allowed: boolean; retryAfterSec: number } {
  const cfg = RATE_LIMITS[pathname];
  if (!cfg) return { allowed: true, retryAfterSec: 0 };

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Passive cleanup: reset if window has expired
  if (!entry || now - entry.windowStart > cfg.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= cfg.max) {
    const retryAfterSec = Math.ceil((cfg.windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count++;
  return { allowed: true, retryAfterSec: 0 };
}

