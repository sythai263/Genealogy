/**
 * @project AncestorTree
 * @file src/app/api/health/route.ts
 * @description Liveness/readiness probe — checks DB connectivity via a
 *              lightweight query. No secrets or internals are exposed.
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { API_ERROR_MESSAGES, API_STATUS } from '@constants';
import {
  apiError,
  apiOk,
  createServiceRoleClient,
  withApiHandler,
} from '@lib/api';

export const GET = withApiHandler('health', async () => {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return apiError(
      API_ERROR_MESSAGES.serverMisconfigured,
      API_STATUS.serverError
    );
  }

  const { error } = await supabase
    .from('profiles')
    .select('user_id')
    .limit(1);

  if (error) {
    return apiError(API_ERROR_MESSAGES.serverError, API_STATUS.serverError);
  }

  return apiOk({ status: 'ok', timestamp: new Date().toISOString() });
});
