/**
 * @project AncestorTree
 * @file src/hooks/use-names.ts
 * @description React Query hooks for the name dictionary — public search,
 *              community submission and admin moderation
 * @version 1.0.0
 * @updated 2026-10-30
 */

'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { PEOPLE_SEARCH_DEBOUNCE_MS } from '@constants';
import {
  approveName,
  createAdminName,
  deleteName,
  getAdminNames,
  searchNames,
  submitName,
  updateName,
  type AdminNameFilters,
  type AdminNameInput,
  type NameSearchFilters,
} from '@lib';
import type { NameSubmission } from '@types';

export const nameKeys = {
  all: ['names'] as const,
  search: (filters: NameSearchFilters) =>
    [...nameKeys.all, 'search', filters] as const,
  admin: (filters: AdminNameFilters) =>
    [...nameKeys.all, 'admin', filters] as const,
};

export function useNameSearch(
  filters: Omit<NameSearchFilters, 'page' | 'pageSize'>
) {
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedKeyword(filters.keyword);
      setPage(1);
    }, PEOPLE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [filters.keyword, filters.gender, filters.nameWordCount]);

  const query = useQuery({
    queryKey: nameKeys.search({
      ...filters,
      keyword: debouncedKeyword,
      page,
      pageSize: 30,
    }),
    queryFn: () =>
      searchNames({ ...filters, keyword: debouncedKeyword, page, pageSize: 30 }),
    placeholderData: (prev) => prev,
  });

  return { ...query, page, setPage };
}

export function useSubmitName() {
  const t = useTranslations('Names');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NameSubmission) => submitName(payload),
    onSuccess: () => {
      toast.success(t('contribute.success'));
      void queryClient.invalidateQueries({ queryKey: nameKeys.all });
    },
    onError: () => toast.error(t('contribute.error')),
  });
}

export function useAdminNames(filters: AdminNameFilters) {
  return useQuery({
    queryKey: nameKeys.admin(filters),
    queryFn: () => getAdminNames(filters),
    placeholderData: (prev) => prev,
  });
}

export function useApproveName() {
  const t = useTranslations('Names');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveName(id),
    onSuccess: () => {
      toast.success(t('admin.approved'));
      void queryClient.invalidateQueries({ queryKey: nameKeys.all });
    },
    onError: () => toast.error(t('admin.error')),
  });
}

export function useCreateName() {
  const t = useTranslations('Names');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminNameInput) => createAdminName(input),
    onSuccess: () => {
      toast.success(t('admin.created'));
      void queryClient.invalidateQueries({ queryKey: nameKeys.all });
    },
    onError: () => toast.error(t('admin.error')),
  });
}

export function useUpdateName() {
  const t = useTranslations('Names');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminNameInput }) =>
      updateName(id, input),
    onSuccess: () => {
      toast.success(t('admin.updated'));
      void queryClient.invalidateQueries({ queryKey: nameKeys.all });
    },
    onError: () => toast.error(t('admin.error')),
  });
}

export function useDeleteName() {
  const t = useTranslations('Names');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteName(id),
    onSuccess: () => {
      toast.success(t('admin.deleted'));
      void queryClient.invalidateQueries({ queryKey: nameKeys.all });
    },
    onError: () => toast.error(t('admin.error')),
  });
}
