/**
 * @project AncestorTree
 * @file src/lib/supabase-data-documents.ts
 * @description Supabase data functions for clan documents (Kho tài liệu)
 * @version 1.0.0
 * @updated 2026-02-27
 */

import { supabase } from './supabase';
import { escapeIlikePattern } from './utils';
import { getPaginationRange } from '@constants';
import type {
  ClanDocument,
  CreateClanDocumentInput,
  DocumentsListFilters,
  PaginatedResult,
  UpdateClanDocumentInput,
} from '@/types';

export async function getDocuments(
  filters: DocumentsListFilters
): Promise<PaginatedResult<ClanDocument>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('clan_documents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const trimmed = filters.search?.trim();
  if (trimmed) {
    const pattern = `%${escapeIlikePattern(trimmed)}%`;

    const { data: matchingPeople, error: peopleError } = await supabase
      .from('people')
      .select('id')
      .ilike('display_name', pattern)
      .limit(50);

    if (peopleError) throw peopleError;

    const personIds = (matchingPeople || []).map((p) => p.id);
    const orParts = [`title.ilike."${pattern}"`, `tags.ilike."${pattern}"`];
    if (personIds.length > 0) {
      orParts.push(`person_id.in.(${personIds.join(',')})`);
    }
    query = query.or(orParts.join(','));
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

export async function getDocument(id: string): Promise<ClanDocument | null> {
  const { data, error } = await supabase
    .from('clan_documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getDocumentsByPerson(personId: string): Promise<ClanDocument[]> {
  const { data, error } = await supabase
    .from('clan_documents')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createDocument(input: CreateClanDocumentInput): Promise<ClanDocument> {
  const { data, error } = await supabase
    .from('clan_documents')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, input: UpdateClanDocumentInput): Promise<ClanDocument> {
  const { data, error } = await supabase
    .from('clan_documents')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('clan_documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadDocumentFile(file: File, path: string): Promise<string> {
  const isDesktop = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_DESKTOP_MODE === 'true';

  if (isDesktop) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/media/documents/${path}`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return `/api/media/documents/${path}`;
  }

  const { error } = await supabase.storage
    .from('media')
    .upload(`documents/${path}`, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(`documents/${path}`);

  return urlData.publicUrl;
}

export async function deleteDocumentFile(fileUrl: string): Promise<void> {
  const isDesktop = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_DESKTOP_MODE === 'true';

  if (isDesktop) {
    const path = fileUrl.replace('/api/media/', '');
    await fetch(`/api/media/${path}`, { method: 'DELETE' });
    return;
  }

  // SEC-WARN-02: Use indexOf to handle URLs that contain multiple '/media/' segments.
  // e.g. https://x.co/storage/v1/object/public/media/documents/media/file.pdf
  // → correct path: 'documents/media/file.pdf' (not 'file.pdf')
  const markerIdx = fileUrl.indexOf('/storage/v1/object/public/media/');
  if (markerIdx !== -1) {
    const storagePath = fileUrl.slice(markerIdx + '/storage/v1/object/public/media/'.length);
    if (storagePath) {
      await supabase.storage.from('media').remove([storagePath]);
    }
    return;
  }
  // Fallback: try splitting on last '/media/' occurrence
  const lastMediaIdx = fileUrl.lastIndexOf('/media/');
  if (lastMediaIdx !== -1) {
    const storagePath = fileUrl.slice(lastMediaIdx + '/media/'.length);
    if (storagePath) {
      await supabase.storage.from('media').remove([storagePath]);
    }
  }
}
