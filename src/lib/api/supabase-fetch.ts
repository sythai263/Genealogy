/**
 * @project AncestorTree
 * @file src/lib/api/supabase-fetch.ts
 * @description Docker-aware fetch + cookie-bound Supabase server client
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

/**
 * Network URL used for outbound calls. Inside Docker this differs from the
 * public URL, which must still be used for cookie/storage-key derivation.
 */
export function getSupabaseNetworkUrl(): string {
  return (
    process.env.SUPABASE_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  );
}

/** Public URL — determines the `sb-<host>-auth-token` cookie name */
export function getSupabaseCookieUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

/**
 * Creates a fetch that rewrites NEXT_PUBLIC_SUPABASE_URL → SUPABASE_INTERNAL_URL
 * so `createServerClient` can keep the public URL (correct cookie name) while
 * requests still reach the container-visible host.
 */
export function makeDockerAwareFetch(): typeof fetch {
  const publicUrl = getSupabaseCookieUrl();
  const internalUrl = process.env.SUPABASE_INTERNAL_URL;

  if (!publicUrl || !internalUrl || internalUrl === publicUrl) {
    return fetch;
  }

  return function dockerFetch(input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string' && input.startsWith(publicUrl)) {
      return fetch(input.replace(publicUrl, internalUrl), init);
    }
    return fetch(input, init);
  };
}

/** Expected auth cookie name for the configured Supabase project */
export function getAuthCookieName(): string {
  const cookieUrl = getSupabaseCookieUrl();
  if (!cookieUrl) return 'unknown';
  return `sb-${new URL(cookieUrl).hostname.split('.')[0]}-auth-token`;
}

/** Read-only Supabase client bound to the incoming request cookies */
export function createRequestScopedClient(request: NextRequest) {
  return createServerClient(
    getSupabaseCookieUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      global: { fetch: makeDockerAwareFetch() },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );
}
