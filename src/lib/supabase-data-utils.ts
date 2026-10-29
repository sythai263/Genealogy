/**
 * @project AncestorTree
 * @file src/lib/supabase-data-utils.ts
 * @description Shared helpers + contact-field security constant for the
 *              supabase data layer
 * @version 1.0.0
 * @updated 2026-10-29
 */

// NEVER expose these in public/unauthenticated queries.
// ═══════════════════════════════════════════════════════════════════════════
export const CONTACT_FIELDS = ['phone', 'email', 'zalo', 'facebook', 'address'] as const;

/** Supabase `.in()` filters are chunked to stay well under URL/query limits. */
export const ID_LOOKUP_CHUNK_SIZE = 100;

export function chunkIds(ids: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

