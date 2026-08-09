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

/** True when the server runs inside the Electron desktop shell */
export function isDesktopMode(): boolean {
  return (
    process.env.DESKTOP_MODE === 'true' ||
    process.env.NEXT_PUBLIC_DESKTOP_MODE === 'true'
  );
}

/**
 * Blocks the route in web mode. Returns 404 so the endpoint is indistinguishable
 * from a non-existent route when the app is deployed as a website.
 */
export function guardDesktopOnly(): NextResponse | null {
  if (process.env.NEXT_PUBLIC_DESKTOP_MODE !== 'true') {
    return apiError(API_ERROR_MESSAGES.desktopOnly, API_STATUS.notFound);
  }
  return null;
}

/** Blocks the route in desktop mode, where the work is done client-side */
export function guardWebOnly(): NextResponse | null {
  if (process.env.NEXT_PUBLIC_DESKTOP_MODE === 'true') {
    return apiError(API_ERROR_MESSAGES.webOnly, API_STATUS.badRequest);
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
