/**
 * @project AncestorTree
 * @file src/hooks/use-people.ts
 * @description React Query hooks for people data
 * @version 1.1.0
 * @updated 2026-07-19
 */

'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PEOPLE_SEARCH_DEBOUNCE_MS } from '@constants';
import {
  createPerson,
  deletePerson,
  getPeople,
  getPeopleByGeneration,
  getPeopleFilterOptions,
  getPerson,
  getStats,
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
  filterOptions: () => [...peopleKeys.all, 'filter-options'] as const,
  stats: () => [...peopleKeys.all, 'stats'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePeople() {
  return useQuery({
    queryKey: peopleKeys.lists(),
    queryFn: getPeople,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * People list with Supabase-side search + filters (debounced query).
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

export function useSearchPeople(query: string) {
  return useQuery({
    queryKey: peopleKeys.search(query),
    queryFn: () => searchPeople(query),
    enabled: query.length >= 2,
  });
}

export function useSearchPeopleAdvanced(
  query: string,
  ignoreAccents: boolean = true
) {
  return useQuery({
    queryKey: peopleKeys.advancedSearch(query, ignoreAccents),
    queryFn: () => searchPeopleAdvanced(query, ignoreAccents),
    enabled: query.length >= 2,
  });
}

export function usePeopleByGeneration(generation: number) {
  return useQuery({
    queryKey: peopleKeys.byGeneration(generation),
    queryFn: () => getPeopleByGeneration(generation),
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
