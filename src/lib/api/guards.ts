/**
 * @project AncestorTree
 * @file src/lib/api/guards.ts
 * @description Reusable mode/auth/role guards for API route handlers
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { NextResponse } from 'next/server';
import {
  API_ADMIN_ROLES,
  API_ERROR_MESSAGES,
  API_STATUS,
} from '@constants';
import type { AuthorizedRequester, UserRole } from '@types';
import { apiError } from './responses';
import { createServiceRoleClient } from './supabase-admin';

/**
 * Blocks the route outside development. Returns 404 so the endpoint is
 * indistinguishable from a non-existent route in production.
 */
export function guardDevelopmentOnly(): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    return apiError(API_ERROR_MESSAGES.notFound, API_STATUS.notFound);
  }
  return null;
}

/** Validates the `Authorization: Bearer <CRON_SECRET>` header */
export function requireCronSecret(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return apiError(API_ERROR_MESSAGES.unauthorized, API_STATUS.unauthorized);
  }
  return null;
}

/**
 * Resolves the caller from an `Authorization: Bearer <access_token>` header and
 * checks their profile role. Returns a `NextResponse` to short-circuit on failure.
 */
export async function requireRole(
  request: Request,
  roles: readonly UserRole[] = API_ADMIN_ROLES
): Promise<AuthorizedRequester | NextResponse> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return apiError(
      API_ERROR_MESSAGES.serverMisconfigured,
      API_STATUS.serverError
    );
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return apiError(API_ERROR_MESSAGES.unauthorized, API_STATUS.unauthorized);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authHeader.slice(7));

  if (authError || !user) {
    return apiError(API_ERROR_MESSAGES.unauthorized, API_STATUS.unauthorized);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single<{ role: UserRole }>();

  if (!profile || !roles.includes(profile.role)) {
    return apiError(API_ERROR_MESSAGES.forbidden, API_STATUS.forbidden);
  }

  return { userId: user.id, role: profile.role };
}
