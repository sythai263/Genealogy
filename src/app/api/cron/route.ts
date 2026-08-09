/**
 * @project AncestorTree
 * @file src/app/api/cron/route.ts
 * @description Vercel Cron — lightweight database keep-alive ping
 * @version 2.0.0
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

export const GET = withApiHandler('cron', async (request) => {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return apiError(API_ERROR_MESSAGES.serverMisconfigured, API_STATUS.serverError);
  }

  const { error } = await supabase.from('profiles').select('user_id').limit(1);
  if (error) throw error;

  return apiOk({ success: true, timestamp: new Date().toISOString() });
});
