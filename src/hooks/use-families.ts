/**
 * @project AncestorTree
 * @file src/hooks/use-families.ts
 * @description React Query hooks for families data
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFamiliesCount, getFamily, getFamilyChildren, createFamily, addChildToFamily, removeChildFromFamily, getTreeData, getPersonRelations, addPersonToParentFamily, createSpouseFamily, getFamiliesMissingSpouse, addChildForPerson } from '@lib';
import type { Family, FamiliesMissingSpouseFilters } from '@types';

// Query keys
export const familyKeys = {
  all: ['families'] as const,
  lists: () => [...familyKeys.all, 'list'] as const,
  details: () => [...familyKeys.all, 'detail'] as const,
  detail: (id: string) => [...familyKeys.details(), id] as const,
  children: (id: string) => [...familyKeys.all, 'children', id] as const,
  relations: (id: string) => [...familyKeys.all, 'relations', id] as const,
  missingSpouse: (filters: FamiliesMissingSpouseFilters) =>
    [...familyKeys.all, 'missing-spouse', filters] as const,
  count: () => [...familyKeys.all, 'count'] as const,
  tree: () => ['tree'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useFamily(id: string | undefined) {
  return useQuery({
    queryKey: familyKeys.detail(id!),
    queryFn: () => getFamily(id!),
    enabled: !!id,
  });
}

export function useFamilyChildren(familyId: string | undefined) {
  return useQuery({
    queryKey: familyKeys.children(familyId!),
    queryFn: () => getFamilyChildren(familyId!),
    enabled: !!familyId,
  });
}

export function useTreeData() {
  return useQuery({
    queryKey: familyKeys.tree(),
    queryFn: getTreeData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFamiliesMissingSpouse(filters: FamiliesMissingSpouseFilters) {
  return useQuery({
    queryKey: familyKeys.missingSpouse(filters),
    queryFn: () => getFamiliesMissingSpouse(filters),
  });
}

/** Head-count only — for dashboard cards. */
export function useFamiliesCount() {
  return useQuery({
    queryKey: familyKeys.count(),
    queryFn: getFamiliesCount,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateFamily() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: Omit<Family, 'id' | 'created_at' | 'updated_at'>) => 
      createFamily(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      queryClient.invalidateQueries({ queryKey: familyKeys.tree() });
    },
  });
}

export function useAddChildToFamily() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ familyId, personId, sortOrder }: { 
      familyId: string; 
      personId: string; 
      sortOrder: number;
    }) => addChildToFamily(familyId, personId, sortOrder),
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({ queryKey: familyKeys.children(familyId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.tree() });
    },
  });
}

export function useRemoveChildFromFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ familyId, personId }: { familyId: string; personId: string }) =>
      removeChildFromFamily(familyId, personId),
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({ queryKey: familyKeys.children(familyId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.tree() });
    },
  });
}

export function usePersonRelations(personId: string | undefined) {
  return useQuery({
    queryKey: familyKeys.relations(personId!),
    queryFn: () => getPersonRelations(personId!),
    enabled: !!personId,
    staleTime: 5 * 60 * 1000, // 5 minutes — 3-phase query is heavy
  });
}

export function useAddPersonToParentFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fatherId,
      motherId,
      childPersonId,
    }: {
      fatherId: string | null;
      motherId: string | null;
      childPersonId: string;
    }) => addPersonToParentFamily(fatherId, motherId, childPersonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      queryClient.invalidateQueries({ queryKey: familyKeys.tree() });
    },
  });
}

export function useCreateSpouseFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      personId,
      personGender,
      spouseId,
      targetFamilyId,
    }: {
      personId: string;
      personGender: 1 | 2;
      spouseId: string;
      targetFamilyId?: string;
    }) => createSpouseFamily(personId, personGender, spouseId, { targetFamilyId }),
    onSuccess: (_, { personId, spouseId }) => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      queryClient.invalidateQueries({ queryKey: familyKeys.tree() });
      queryClient.invalidateQueries({ queryKey: familyKeys.relations(personId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.relations(spouseId) });
    },
  });
}

export function useAddChildToFamilyMutation(personId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      familyId,
      childPersonId,
      parentPersonId,
      parentGender,
    }: {
      familyId?: string;
      childPersonId: string;
      parentPersonId: string;
      parentGender: 1 | 2;
    }) => addChildForPerson(parentPersonId, parentGender, childPersonId, familyId),
    onSuccess: (_, { childPersonId, parentPersonId }) => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      queryClient.invalidateQueries({ queryKey: familyKeys.tree() });
      queryClient.invalidateQueries({ queryKey: familyKeys.relations(parentPersonId) });
      queryClient.invalidateQueries({ queryKey: familyKeys.relations(childPersonId) });
      if (personId && personId !== parentPersonId) {
        queryClient.invalidateQueries({ queryKey: familyKeys.relations(personId) });
      }
    },
  });
}
