/**
 * @project AncestorTree
 * @file src/app/api/cron/route.ts
 * @description Vercel Cron — database keep-alive ping + event_reminder scan.
 *              Sends one notification per event per user for events within the
 *              next 3 days (deduplicated against recent notifications).
 * @version 2.1.0
 * @updated 2026-08-09
 */

import { API_ERROR_MESSAGES, API_STATUS } from '@constants';
import {
  apiError,
  apiOk,
  createServiceRoleClient,
  requireCronSecret,
  withApiHandler,
} from '@lib/api';
import type { SupabaseClient } from '@supabase/supabase-js';

const EVENT_REMINDER_LOOKAHEAD_DAYS = 3;
const EVENT_REMINDER_DEDUPE_DAYS = 4;

interface UpcomingEvent {
  id: string;
  title: string;
  event_date: string;
}

/**
 * Inserts `event_reminder` notifications for verified members about events
 * happening within the lookahead window. A user is only reminded once per
 * event per dedupe window.
 */
async function sendEventReminders(supabase: SupabaseClient): Promise<number> {
  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const until = new Date(
    today.getTime() + EVENT_REMINDER_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10);

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, title, event_date')
    .gte('event_date', from)
    .lte('event_date', until)
    .limit(50);

  if (eventsError) throw eventsError;
  if (!events || events.length === 0) return 0;

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('is_verified', true)
    .eq('is_suspended', false)
    .limit(500);

  if (profilesError) throw profilesError;
  if (!profiles || profiles.length === 0) return 0;

  const dedupeSince = new Date(
    today.getTime() - EVENT_REMINDER_DEDUPE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: existing, error: existingError } = await supabase
    .from('notifications')
    .select('user_id, reference_id')
    .eq('type', 'event_reminder')
    .in('reference_id', events.map((event: UpcomingEvent) => event.id))
    .gte('created_at', dedupeSince);

  if (existingError) throw existingError;

  const alreadySent = new Set(
    (existing ?? []).map(
      (row: { user_id: string; reference_id: string | null }) =>
        `${row.user_id}:${row.reference_id}`
    )
  );

  const inserts = [];
  for (const event of events as UpcomingEvent[]) {
    for (const profile of profiles) {
      const key = `${profile.user_id}:${event.id}`;
      if (alreadySent.has(key)) continue;
      alreadySent.add(key);
      inserts.push({
        user_id: profile.user_id,
        type: 'event_reminder',
        title: 'Sự kiện sắp diễn ra',
        body: `"${event.title}" sẽ diễn ra vào ngày ${event.event_date}`,
        link: '/events',
        reference_id: event.id,
      });
    }
  }

  if (inserts.length === 0) return 0;

  const { error: insertError } = await supabase
    .from('notifications')
    .insert(inserts);
  if (insertError) throw insertError;

  return inserts.length;
}

export const GET = withApiHandler('cron', async (request) => {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return apiError(API_ERROR_MESSAGES.serverMisconfigured, API_STATUS.serverError);
  }

  const { error } = await supabase.from('profiles').select('user_id').limit(1);
  if (error) throw error;

  const remindersSent = await sendEventReminders(supabase);

  return apiOk({
    success: true,
    reminders_sent: remindersSent,
    timestamp: new Date().toISOString(),
  });
});
