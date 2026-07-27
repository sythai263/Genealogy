/**
 * @project AncestorTree
 * @file src/hooks/use-achievements.ts
 * @description React Query hooks for achievements
 * @version 1.2.0
 * @updated 2026-07-27
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PEOPLE_SEARCH_DEBOUNCE_MS } from '@constants';
import {
  getAchievements,
  getAchievementsByPerson,
  getFeaturedAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '@/lib/supabase-data-achievements';
import type {
  AchievementsListFilters,
  CreateAchievementInput,
  UpdateAchievementInput,
} from '@/types';

export const achievementKeys = {
  all: ['achievements'] as const,
  lists: () => [...achievementKeys.all, 'list'] as const,
  list: (filters: AchievementsListFilters) =>
    [
      ...achievementKeys.lists(),
      {
        category: filters.category ?? null,
        search: filters.search ?? '',
        page: filters.page,
        pageSize: filters.pageSize,
      },
    ] as const,
  byPerson: (personId: string) => [...achievementKeys.all, 'person', personId] as const,
  featured: () => [...achievementKeys.all, 'featured'] as const,
};

export function useAchievements(filters: AchievementsListFilters) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, PEOPLE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryFilters: AchievementsListFilters = {
    category: filters.category,
    search: debouncedSearch,
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return useQuery({
    queryKey: achievementKeys.list(queryFilters),
    queryFn: () => getAchievements(queryFilters),
  });
}

export function usePersonAchievements(personId: string | undefined) {
  return useQuery({
    queryKey: achievementKeys.byPerson(personId!),
    queryFn: () => getAchievementsByPerson(personId!),
    enabled: !!personId,
  });
}

export function useFeaturedAchievements() {
  return useQuery({
    queryKey: achievementKeys.featured(),
    queryFn: getFeaturedAchievements,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAchievementInput) => createAchievement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAchievementInput }) =>
      updateAchievement(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
}
