/**
 * @project AncestorTree
 * @file src/hooks/use-people.ts
 * @description React Query hooks for people data
 * @version 1.3.0
 * @updated 2026-08-09
 */

'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PEOPLE_SEARCH_DEBOUNCE_MS } from '@constants';
import {
  createPerson,
  deletePerson,
  getPeopleByGeneration,
  getPeopleByIds,
  getPeopleFilterOptions,
  getPerson,
  getStats,
  getUpcomingMemorialPeople,
  searchPeople,
  searchPeopleAdvanced,
  searchPeopleFiltered,
  updatePerson,
} from '@lib';
import type {
  CreatePersonInput,
  PeopleListFilters,
  UpdatePersonInput,
} from '@types';

export const peopleKeys = {
  all: ['people'] as const,
  lists: () => [...peopleKeys.all, 'list'] as const,
  list: (filters: PeopleListFilters) =>
    [...peopleKeys.lists(), filters] as const,
  details: () => [...peopleKeys.all, 'detail'] as const,
  detail: (id: string) => [...peopleKeys.details(), id] as const,
  search: (query: string) => [...peopleKeys.all, 'search', query] as const,
  advancedSearch: (query: string, ignoreAccents: boolean) =>
    [...peopleKeys.all, 'advanced-search', query, ignoreAccents] as const,
  byGeneration: (gen: number) =>
    [...peopleKeys.all, 'generation', gen] as const,
  byIds: (ids: string[]) =>
    [...peopleKeys.all, 'by-ids', [...ids].sort().join(',')] as const,
  filterOptions: () => [...peopleKeys.all, 'filter-options'] as const,
  stats: () => [...peopleKeys.all, 'stats'] as const,
  upcomingMemorial: () => [...peopleKeys.all, 'upcoming-memorial'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * People list with Supabase-side search + filters (debounced query).
 * Returns paginated `{ items, total }` — never loads the full table.
 */
export function usePeopleList(filters: PeopleListFilters) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, PEOPLE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryFilters: PeopleListFilters = {
    ...filters,
    search: debouncedSearch,
  };

  return useQuery({
    queryKey: peopleKeys.list(queryFilters),
    queryFn: () => searchPeopleFiltered(queryFilters),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function usePeopleFilterOptions() {
  return useQuery({
    queryKey: peopleKeys.filterOptions(),
    queryFn: getPeopleFilterOptions,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePerson(id: string | undefined) {
  return useQuery({
    queryKey: peopleKeys.detail(id!),
    queryFn: () => getPerson(id!),
    enabled: !!id,
  });
}

/** Debounce typing before hitting the people search API. */
function useDebouncedSearchQuery(query: string): string {
  const trimmed = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmed);

  useEffect(() => {
    if (trimmed.length < 2) {
      setDebouncedQuery(trimmed);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, PEOPLE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed]);

  return debouncedQuery;
}

export function useSearchPeople(query: string) {
  const debouncedQuery = useDebouncedSearchQuery(query);
  const isDebouncing =
    query.trim().length >= 2 && query.trim() !== debouncedQuery;

  const result = useQuery({
    queryKey: peopleKeys.search(debouncedQuery),
    queryFn: () => searchPeople(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return {
    ...result,
    isFetching: result.isFetching || isDebouncing,
  };
}

export function useSearchPeopleAdvanced(
  query: string,
  ignoreAccents: boolean = true
) {
  const debouncedQuery = useDebouncedSearchQuery(query);
  const isDebouncing =
    query.trim().length >= 2 && query.trim() !== debouncedQuery;

  const result = useQuery({
    queryKey: peopleKeys.advancedSearch(debouncedQuery, ignoreAccents),
    queryFn: () => searchPeopleAdvanced(debouncedQuery, ignoreAccents),
    enabled: debouncedQuery.length >= 2,
  });

  return {
    ...result,
    isFetching: result.isFetching || isDebouncing,
  };
}

export function usePeopleByGeneration(generation: number) {
  return useQuery({
    queryKey: peopleKeys.byGeneration(generation),
    queryFn: () => getPeopleByGeneration(generation),
  });
}

/** Batch person lookup by id (name maps) — never loads the full table. */
export function usePeopleByIds(ids: string[]) {
  const sortedIds = [...ids].sort();
  return useQuery({
    queryKey: peopleKeys.byIds(sortedIds),
    queryFn: () => getPeopleByIds(sortedIds),
    enabled: sortedIds.length > 0,
  });
}

/** Deceased people with lunar death dates only — for auto-giỗ (memorial) scans. */
export function useUpcomingMemorialPeople() {
  return useQuery({
    queryKey: peopleKeys.upcomingMemorial(),
    queryFn: getUpcomingMemorialPeople,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: peopleKeys.stats(),
    queryFn: getStats,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePersonInput) => createPerson(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePersonInput }) =>
      updatePerson(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: peopleKeys.filterOptions() });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.all });
    },
  });
}
