/**
 * @project AncestorTree
 * @file src/app/api/ping/route.ts
 * @description Minimal keep-alive endpoint for external cron monitors
 *              (cron-job.org, UptimeRobot) — upserts the keep_alive row so the
 *              Supabase free-tier project registers activity, and returns a
 *              tiny JSON body (cron services abort on large HTML responses).
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { apiOk, pingKeepAlive, withApiHandler } from '@lib/api';

export const GET = withApiHandler('ping', async () => {
  const { pinged_at: pingedAt } = await pingKeepAlive();
  return apiOk({ pong: true, pinged_at: pingedAt });
});
