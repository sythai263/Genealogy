/**
 * @project AncestorTree
 * @file src/services/notifications.ts
 * @description Client-side calls to the notifications API routes
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { API_ERROR_MESSAGES } from '@constants';
import { supabase } from '@lib';
import { requestJson } from './http';

interface BroadcastResult {
  sent: number;
}

export async function broadcastSystemNotification(input: {
  title: string;
  body?: string;
  link?: string;
}): Promise<BroadcastResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error(API_ERROR_MESSAGES.unauthorized);

  return requestJson<BroadcastResult>(
    '/api/notifications/broadcast',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
    API_ERROR_MESSAGES.serverError
  );
}
