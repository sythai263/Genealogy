/**
 * @project AncestorTree
 * @file src/hooks/use-registrations.ts
 * @description React Query hooks for member registrations
 * @version 1.2.0
 * @updated 2026-07-27
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PEOPLE_SEARCH_DEBOUNCE_MS } from '@constants';
import {
  getRegistrations,
  getPendingRegistrationCount,
  submitRegistration,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
} from '@/lib/supabase-data-registrations';
import type { CreateRegistrationInput, RegistrationsListFilters } from '@/types';

export const registrationKeys = {
  all: ['registrations'] as const,
  list: (filters: RegistrationsListFilters) =>
    [
      ...registrationKeys.all,
      'list',
      {
        status: filters.status ?? null,
        search: filters.search ?? '',
        page: filters.page,
        pageSize: filters.pageSize,
      },
    ] as const,
  pending: () => [...registrationKeys.all, 'pending'] as const,
};

export function useRegistrations(filters: RegistrationsListFilters) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, PEOPLE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryFilters: RegistrationsListFilters = {
    status: filters.status,
    search: debouncedSearch,
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return useQuery({
    queryKey: registrationKeys.list(queryFilters),
    queryFn: () => getRegistrations(queryFilters),
  });
}

export function usePendingRegistrationCount() {
  return useQuery({
    queryKey: registrationKeys.pending(),
    queryFn: () => getPendingRegistrationCount(),
    refetchInterval: 120_000,
  });
}

export function useSubmitRegistration() {
  return useMutation({
    mutationFn: (input: CreateRegistrationInput) => submitRegistration(input),
  });
}

export function useApproveRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, personId }: { id: string; personId?: string }) =>
      approveRegistration(id, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
    },
  });
}

export function useRejectRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectRegistration(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
    },
  });
}

export function useDeleteRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
    },
  });
}
