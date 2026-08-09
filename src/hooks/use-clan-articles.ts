/**
 * @project AncestorTree
 * @file src/hooks/use-clan-articles.ts
 * @description React Query hooks for clan articles (hương ước)
 * @version 2.0.0
 * @updated 2026-08-09
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClanArticles, getFeaturedArticles, createClanArticle, updateClanArticle, deleteClanArticle } from '@lib';
import type { ClanArticlesListFilters, CreateClanArticleInput, UpdateClanArticleInput } from '@types';

export const clanArticleKeys = {
  all: ['clan-articles'] as const,
  lists: () => [...clanArticleKeys.all, 'list'] as const,
  list: (filters: ClanArticlesListFilters) => [...clanArticleKeys.lists(), filters] as const,
  featured: () => [...clanArticleKeys.all, 'featured'] as const,
};

/**
 * Paginated clan articles list. `category` and `page`/`pageSize` are
 * optional — omitted values default to "all categories" / a single page of
 * `LIST_DEFAULT_PAGE_SIZE`-ish (50) records, which comfortably covers the
 * current hương ước content volume while still bounding the query.
 */
export function useClanArticles(
  filters?: Partial<ClanArticlesListFilters>
) {
  const resolvedFilters: ClanArticlesListFilters = {
    category: filters?.category,
    page: filters?.page ?? 1,
    pageSize: filters?.pageSize ?? 50,
  };

  return useQuery({
    queryKey: clanArticleKeys.list(resolvedFilters),
    queryFn: () => getClanArticles(resolvedFilters),
  });
}

export function useFeaturedArticles() {
  return useQuery({
    queryKey: clanArticleKeys.featured(),
    queryFn: getFeaturedArticles,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateClanArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClanArticleInput) => createClanArticle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clanArticleKeys.all });
    },
  });
}

export function useUpdateClanArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClanArticleInput }) =>
      updateClanArticle(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clanArticleKeys.all });
    },
  });
}

export function useDeleteClanArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClanArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clanArticleKeys.all });
    },
  });
}
