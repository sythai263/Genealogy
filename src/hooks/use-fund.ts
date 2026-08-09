/**
 * @project AncestorTree
 * @file src/hooks/use-fund.ts
 * @description React Query hooks for fund transactions and scholarships
 * @version 2.0.0
 * @updated 2026-08-09
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFundTransactions,
  getAllFundTransactions,
  getFundBalance,
  createFundTransaction,
  deleteFundTransaction,
  getScholarships,
  getAllScholarships,
  createScholarship,
  updateScholarshipStatus,
  deleteScholarship,
} from '@lib';
import type {
  CreateFundTransactionInput,
  CreateScholarshipInput,
  FundTransactionsListFilters,
  ScholarshipStatus,
  ScholarshipsListFilters,
} from '@types';

export const fundKeys = {
  all: ['fund'] as const,
  transactions: () => [...fundKeys.all, 'transactions'] as const,
  transactionsList: (filters: FundTransactionsListFilters) =>
    [...fundKeys.transactions(), 'list', filters] as const,
  transactionsAll: (academicYear?: string) =>
    [...fundKeys.transactions(), 'all', { academicYear }] as const,
  balance: () => [...fundKeys.all, 'balance'] as const,
  scholarships: () => [...fundKeys.all, 'scholarships'] as const,
  scholarshipsList: (filters: ScholarshipsListFilters) =>
    [...fundKeys.scholarships(), 'list', filters] as const,
  scholarshipsAll: (academicYear?: string) =>
    [...fundKeys.scholarships(), 'all', { academicYear }] as const,
};

// ─── Fund Transactions ───────────────────────────────────────────────────────

/** Paginated transactions list — never loads the full table. */
export function useFundTransactions(filters: FundTransactionsListFilters) {
  return useQuery({
    queryKey: fundKeys.transactionsList(filters),
    queryFn: () => getFundTransactions(filters),
  });
}

/** Full transactions list — CSV/PDF export and dashboards only. */
export function useAllFundTransactions(academicYear?: string) {
  return useQuery({
    queryKey: fundKeys.transactionsAll(academicYear),
    queryFn: () => getAllFundTransactions(academicYear),
  });
}

export function useFundBalance() {
  return useQuery({
    queryKey: fundKeys.balance(),
    queryFn: getFundBalance,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateFundTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFundTransactionInput) => createFundTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundKeys.all });
    },
  });
}

export function useDeleteFundTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFundTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundKeys.all });
    },
  });
}

// ─── Scholarships ────────────────────────────────────────────────────────────

/** Paginated scholarships list — never loads the full table. */
export function useScholarships(filters: ScholarshipsListFilters) {
  return useQuery({
    queryKey: fundKeys.scholarshipsList(filters),
    queryFn: () => getScholarships(filters),
  });
}

/** Full scholarships list — CSV/PDF export and dashboards only. */
export function useAllScholarships(academicYear?: string) {
  return useQuery({
    queryKey: fundKeys.scholarshipsAll(academicYear),
    queryFn: () => getAllScholarships(academicYear),
  });
}

export function useCreateScholarship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScholarshipInput) => createScholarship(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundKeys.all });
    },
  });
}

export function useUpdateScholarshipStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, approvedBy }: { id: string; status: ScholarshipStatus; approvedBy?: string }) =>
      updateScholarshipStatus(id, status, approvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundKeys.all });
    },
  });
}

export function useDeleteScholarship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScholarship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundKeys.all });
    },
  });
}
