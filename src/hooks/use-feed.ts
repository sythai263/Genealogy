/**
 * @project AncestorTree
 * @file src/hooks/use-feed.ts
 * @description React Query hooks for feed posts, comments, and likes
 * @version 1.2.0
 * @updated 2026-07-27
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PEOPLE_SEARCH_DEBOUNCE_MS } from '@constants';
import {
  getPosts,
  getPostsCount,
  getPost,
  createPost,
  updatePost,
  deletePost,
  hidePost,
  unhidePost,
  getPostComments,
  createComment,
  deleteComment,
  toggleLike,
  getUserLikedPosts,
} from '@/lib/supabase-data-feed';
import type {
  PostsListFilters,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  PostStatus,
} from '@/types';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: PostsListFilters) =>
    [
      ...postKeys.lists(),
      {
        type: filters.type ?? null,
        status: filters.status ?? null,
        search: filters.search ?? '',
        page: filters.page,
        pageSize: filters.pageSize,
      },
    ] as const,
  count: (status: PostStatus | 'all') => [...postKeys.all, 'count', status] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  comments: (postId: string) => [...postKeys.all, 'comments', postId] as const,
  userLikes: (userId: string) => [...postKeys.all, 'userLikes', userId] as const,
};

export function usePosts(filters: PostsListFilters) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, PEOPLE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryFilters: PostsListFilters = {
    type: filters.type,
    status: filters.status,
    search: debouncedSearch,
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return useQuery({
    queryKey: postKeys.list(queryFilters),
    queryFn: () => getPosts(queryFilters),
  });
}

export function usePostsCount(status: PostStatus | 'all' = 'all') {
  return useQuery({
    queryKey: postKeys.count(status),
    queryFn: () => getPostsCount(status),
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: postKeys.detail(id!),
    queryFn: () => getPost(id!),
    enabled: !!id,
  });
}

export function usePostComments(postId: string | undefined) {
  return useQuery({
    queryKey: postKeys.comments(postId!),
    queryFn: () => getPostComments(postId!),
    enabled: !!postId,
  });
}

export function useUserLikedPosts(userId: string | undefined) {
  return useQuery({
    queryKey: postKeys.userLikes(userId!),
    queryFn: () => getUserLikedPosts(userId!),
    enabled: !!userId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePostInput }) => updatePost(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useHidePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hide }: { id: string; hide: boolean }) =>
      hide ? hidePost(id) : unhidePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.post_id) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; postId: string }) => deleteComment(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
