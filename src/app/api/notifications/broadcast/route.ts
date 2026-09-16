/**
 * @project AncestorTree
 * @file src/app/api/notifications/broadcast/route.ts
 * @description Admin broadcast — inserts a `system` notification for every
 *              verified, non-suspended member. Uses the service-role client
 *              because direct notification inserts are RLS-locked to triggers.
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { API_ERROR_MESSAGES, API_STATUS } from '@constants';
import {
  apiError,
  apiOk,
  createServiceRoleClient,
  requireRole,
  withApiHandler,
} from '@lib/api';

const BROADCAST_TITLE_MAX = 200;
const BROADCAST_BODY_MAX = 1000;

interface BroadcastBody {
  title?: string;
  body?: string;
  link?: string;
}

export const POST = withApiHandler(
  'notifications/broadcast',
  async (request) => {
    const requester = await requireRole(request);
    if (requester instanceof Response) return requester;

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return apiError(
        API_ERROR_MESSAGES.serverMisconfigured,
        API_STATUS.serverError
      );
    }

    const payload = (await request.json().catch(() => null)) as BroadcastBody | null;
    const title = payload?.title?.trim() ?? '';
    const body = payload?.body?.trim() ?? '';
    const link = payload?.link?.trim() ?? '';

    if (
      !title ||
      title.length > BROADCAST_TITLE_MAX ||
      body.length > BROADCAST_BODY_MAX ||
      (link && !link.startsWith('/'))
    ) {
      return apiError(API_ERROR_MESSAGES.badRequest, API_STATUS.badRequest);
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('is_verified', true)
      .eq('is_suspended', false)
      .limit(1000);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) return apiOk({ sent: 0 });

    const { error: insertError } = await supabase.from('notifications').insert(
      profiles.map((profile: { user_id: string }) => ({
        user_id: profile.user_id,
        type: 'system',
        title,
        body: body || null,
        link: link || null,
        actor_id: requester.userId,
      }))
    );
    if (insertError) throw insertError;

    return apiOk({ sent: profiles.length });
  },
  API_ERROR_MESSAGES.serverError
);
