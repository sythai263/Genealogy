/**
 * @project AncestorTree
 * @file src/lib/supabase-data-documents.ts
 * @description Supabase data functions for clan documents (Kho tài liệu)
 * @version 1.0.0
 * @updated 2026-02-27
 */

import { supabase } from './supabase';
import { escapeIlikePattern } from './utils';
import {
  DOCUMENTS_BUCKET,
  DOCUMENT_SIGNED_URL_TTL_SECONDS,
  MEDIA_BUCKET,
  getPaginationRange,
} from '@constants';
import type { ClanDocument, CreateClanDocumentInput, DocumentsListFilters, PaginatedResult, UpdateClanDocumentInput } from '@types';

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

/**
 * Files uploaded before the private bucket existed are stored as absolute public
 * URLs on the old `media` bucket; new ones are stored as a path inside `documents`.
 */
function isLegacyPublicUrl(fileRef: string): boolean {
  return fileRef.startsWith('http://') || fileRef.startsWith('https://');
}

/** Returns the object path — the value persisted in `clan_documents.file_url` */
export async function uploadDocumentFile(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  return path;
}

/**
 * Resolves stored file references to URLs the browser can open. Paths in the
 * private bucket become short-lived signed URLs; legacy public URLs pass through.
 */
export async function getDocumentFileUrls(
  fileRefs: string[]
): Promise<Record<string, string>> {
  const resolved: Record<string, string> = {};
  const paths: string[] = [];

  for (const ref of fileRefs) {
    if (!ref) continue;
    if (isLegacyPublicUrl(ref)) {
      resolved[ref] = ref;
    } else {
      paths.push(ref);
    }
  }

  if (paths.length === 0) return resolved;

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrls(paths, DOCUMENT_SIGNED_URL_TTL_SECONDS);

  if (error) throw error;

  for (const entry of data || []) {
    // A null signedUrl means RLS denied this object — leave it unresolved
    if (entry.path && entry.signedUrl) {
      resolved[entry.path] = entry.signedUrl;
    }
  }

  return resolved;
}

export async function deleteDocumentFile(fileRef: string): Promise<void> {
  if (!isLegacyPublicUrl(fileRef)) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([fileRef]);
    return;
  }

  // SEC-WARN-02: Use indexOf to handle URLs that contain multiple '/media/' segments.
  // e.g. https://x.co/storage/v1/object/public/media/documents/media/file.pdf
  // → correct path: 'documents/media/file.pdf' (not 'file.pdf')
  const publicPrefix = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const markerIdx = fileRef.indexOf(publicPrefix);
  if (markerIdx !== -1) {
    const storagePath = fileRef.slice(markerIdx + publicPrefix.length);
    if (storagePath) {
      await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    }
    return;
  }
  // Fallback: try splitting on last '/media/' occurrence
  const lastMediaIdx = fileRef.lastIndexOf(`/${MEDIA_BUCKET}/`);
  if (lastMediaIdx !== -1) {
    const storagePath = fileRef.slice(lastMediaIdx + MEDIA_BUCKET.length + 2);
    if (storagePath) {
      await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    }
  }
}
