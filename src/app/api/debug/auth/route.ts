/**
 * @project AncestorTree
 * @file src/app/api/debug/auth/route.ts
 * @description Debug endpoint: inspect auth state, env vars, Supabase connectivity.
 *              Only active when DEBUG_AUTH=true env var is set.
 *              Usage: GET /api/debug/auth
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { API_STATUS } from '@constants';
import {
  apiError,
  apiOk,
  createRequestScopedClient,
  getAuthCookieName,
  getSupabaseCookieUrl,
  getSupabaseNetworkUrl,
  toErrorMessage,
  withApiHandler,
} from '@lib/api';

const SUPABASE_PROBE_TIMEOUT_MS = 4000;
const SECRET_PREVIEW_LENGTH = 20;
const NOT_SET = '(not set)';

function previewSecret(value: string | undefined): string {
  return value ? `${value.slice(0, SECRET_PREVIEW_LENGTH)}…` : NOT_SET;
}

async function probeSupabase(
  networkUrl: string,
  anonKey: string | undefined
): Promise<{ reachable: boolean; probeMs: number; healthError: string | null }> {
  const startedAt = Date.now();
  try {
    const res = await fetch(`${networkUrl}/rest/v1/`, {
      headers: { apikey: anonKey ?? '', Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(SUPABASE_PROBE_TIMEOUT_MS),
    });
    return {
      reachable: res.ok || res.status === API_STATUS.notFound,
      probeMs: Date.now() - startedAt,
      healthError: null,
    };
  } catch (error) {
    return {
      reachable: false,
      probeMs: Date.now() - startedAt,
      healthError: toErrorMessage(error),
    };
  }
}

export const GET = withApiHandler('debug/auth', async (request) => {
  if (process.env.DEBUG_AUTH !== 'true') {
    return apiError(
      'Debug endpoint disabled. Set DEBUG_AUTH=true to enable.',
      API_STATUS.forbidden
    );
  }

  const networkUrl = getSupabaseNetworkUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseProbe = await probeSupabase(networkUrl, anonKey);

  let userId: string | null = null;
  let authError: string | null = null;
  try {
    const { data, error } = await createRequestScopedClient(request).auth.getUser();
    userId = data?.user?.id ?? null;
    authError = error?.message ?? null;
  } catch (error) {
    authError = toErrorMessage(error);
  }

  const cookies = request.cookies.getAll().map((cookie) => cookie.name);

  return apiOk({
    debug: true,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? NOT_SET,
      SUPABASE_INTERNAL_URL: process.env.SUPABASE_INTERNAL_URL ?? NOT_SET,
      networkUrl,
      cookieKeyUrl: getSupabaseCookieUrl(),
      expectedCookieName: getAuthCookieName(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: previewSecret(anonKey),
      SUPABASE_SERVICE_ROLE_KEY: previewSecret(process.env.SUPABASE_SERVICE_ROLE_KEY),
      BACKUP_DIR: process.env.BACKUP_DIR ?? NOT_SET,
      NEXT_PUBLIC_CLAN_NAME: process.env.NEXT_PUBLIC_CLAN_NAME ?? NOT_SET,
      MIDDLEWARE_LOG: process.env.MIDDLEWARE_LOG ?? NOT_SET,
    },
    supabase: supabaseProbe,
    auth: {
      userId,
      authenticated: !!userId,
      authError,
      hasAuthCookie: cookies.some((name) => name.startsWith('sb-')),
      cookies,
    },
  });
});
