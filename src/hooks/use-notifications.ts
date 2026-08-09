/**
 * @project AncestorTree
 * @file src/hooks/use-notifications.ts
 * @description React Query hooks for in-app notifications
 * @version 2.0.0
 * @updated 2026-08-09
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getRecentNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@lib';
import type { NotificationsListFilters } from '@types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters: NotificationsListFilters) =>
    [...notificationKeys.all, 'list', filters] as const,
  recent: (limit: number) => [...notificationKeys.all, 'recent', limit] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

/** Paginated notifications list — never loads the full table. */
export function useNotifications(filters: NotificationsListFilters) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => getNotifications(filters),
  });
}

/** Small fixed-size fetch for the header bell dropdown. */
export function useRecentNotifications(limit = 10) {
  return useQuery({
    queryKey: notificationKeys.recent(limit),
    queryFn: () => getRecentNotifications(limit),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => getUnreadCount(),
    refetchInterval: 60_000, // Poll every 60 seconds
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
