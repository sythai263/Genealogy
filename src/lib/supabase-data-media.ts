/**
 * @project AncestorTree
 * @file src/lib/supabase-data-media.ts
 * @description Supabase data access — person media (photos) CRUD
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type {
    CreateMediaInput,
    Media,
} from '@types';
import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════
// Media
// ═══════════════════════════════════════════════════════════════════════════

export async function getMediaByPerson(personId: string): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('person_id', personId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createMedia(input: CreateMediaInput): Promise<Media> {
  const { data, error } = await supabase
    .from('media')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMedia(id: string, input: Partial<CreateMediaInput>): Promise<Media> {
  const { data, error } = await supabase
    .from('media')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMedia(id: string): Promise<void> {
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setPrimaryMedia(personId: string, mediaId: string): Promise<void> {
  // Reset all, then set target. If step 2 fails, restore the previous primary.
  const { data: previousPrimary } = await supabase
    .from('media')
    .select('id')
    .eq('person_id', personId)
    .eq('is_primary', true)
    .maybeSingle();

  const { error: resetError } = await supabase
    .from('media')
    .update({ is_primary: false })
    .eq('person_id', personId);

  if (resetError) throw resetError;

  const { error: setError } = await supabase
    .from('media')
    .update({ is_primary: true })
    .eq('id', mediaId);

  if (setError) {
    // Restore previous primary on failure
    if (previousPrimary) {
      await supabase.from('media').update({ is_primary: true }).eq('id', previousPrimary.id);
    }
    throw setError;
  }
}
