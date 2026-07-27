/**
 * @project AncestorTree
 * @file src/hooks/use-profiles.ts
 * @description React Query hooks for user profiles
 * @version 1.2.0
 * @updated 2026-03-01
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfiles,
  getProfilesPage,
  getUnverifiedProfilesCount,
  getProfile,
  updateProfile,
  updateUserRole,
  updateLinkedPerson,
  updateEditRootPerson,
  suspendUser,
  unsuspendUser,
  verifyUser,
  getUnverifiedProfiles,
} from '@/lib/supabase-data';
import { deleteUserAccount } from '@/app/(main)/admin/users/actions';
import type { Profile, ProfilesListFilters, UserRole } from '@/types';

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  list: (filters: ProfilesListFilters) =>
    [
      ...profileKeys.lists(),
      {
        unverifiedOnly: filters.unverifiedOnly ?? false,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    ] as const,
  unverified: () => [...profileKeys.all, 'unverified'] as const,
  unverifiedCount: () => [...profileKeys.all, 'unverified-count'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Full profiles list for author/display lookup maps only. */
export function useProfiles() {
  return useQuery({
    queryKey: profileKeys.lists(),
    queryFn: getProfiles,
  });
}

/** Paginated admin users list — queries one page from the backend. */
export function useProfilesPage(filters: ProfilesListFilters) {
  return useQuery({
    queryKey: profileKeys.list(filters),
    queryFn: () => getProfilesPage(filters),
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId!),
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });
}

export function useUnverifiedProfiles() {
  return useQuery({
    queryKey: profileKeys.unverified(),
    queryFn: getUnverifiedProfiles,
  });
}

export function useUnverifiedProfilesCount() {
  return useQuery({
    queryKey: profileKeys.unverifiedCount(),
    queryFn: getUnverifiedProfilesCount,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: Partial<Profile> }) =>
      updateProfile(userId, input),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// FR-507: link a user to a person in the family tree
export function useUpdateLinkedPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, personId }: { userId: string; personId: string | null }) =>
      updateLinkedPerson(userId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// FR-508: set the subtree edit boundary for a branch editor
export function useUpdateEditRootPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, personId }: { userId: string; personId: string | null }) =>
      updateEditRootPerson(userId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// FR-512: suspend a user account
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// FR-512: unsuspend a user account
export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unsuspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// FR-511: verify/unverify a user account
export function useVerifyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, verified }: { userId: string; verified: boolean }) =>
      verifyUser(userId, verified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.unverified() });
      queryClient.invalidateQueries({ queryKey: profileKeys.unverifiedCount() });
    },
  });
}

// FR-513: delete a user account permanently
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUserAccount(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
