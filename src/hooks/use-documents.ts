/**
 * @project AncestorTree
 * @file src/hooks/use-documents.ts
 * @description React Query hooks for clan documents (Kho tài liệu)
 * @version 1.2.0
 * @updated 2026-07-27
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PEOPLE_SEARCH_DEBOUNCE_MS } from '@constants';
import {
  getDocuments,
  getDocumentsByPerson,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  deleteDocumentFile,
} from '@/lib/supabase-data-documents';
import type {
  CreateClanDocumentInput,
  DocumentsListFilters,
  UpdateClanDocumentInput,
} from '@/types';

export const documentKeys = {
  all: ['clan_documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: DocumentsListFilters) =>
    [
      ...documentKeys.lists(),
      {
        category: filters.category ?? null,
        search: filters.search ?? '',
        page: filters.page,
        pageSize: filters.pageSize,
      },
    ] as const,
  byPerson: (personId: string) => [...documentKeys.all, 'person', personId] as const,
};

export function useDocuments(filters: DocumentsListFilters) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, PEOPLE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryFilters: DocumentsListFilters = {
    category: filters.category,
    search: debouncedSearch,
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return useQuery({
    queryKey: documentKeys.list(queryFilters),
    queryFn: () => getDocuments(queryFilters),
  });
}

export function usePersonDocuments(personId: string | undefined) {
  return useQuery({
    queryKey: documentKeys.byPerson(personId!),
    queryFn: () => getDocumentsByPerson(personId!),
    enabled: !!personId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClanDocumentInput) => createDocument(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClanDocumentInput }) =>
      updateDocument(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) => {
      await deleteDocumentFile(fileUrl);
      await deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useUploadDocumentFile() {
  return useMutation({
    mutationFn: ({ file, path }: { file: File; path: string }) =>
      uploadDocumentFile(file, path),
  });
}
