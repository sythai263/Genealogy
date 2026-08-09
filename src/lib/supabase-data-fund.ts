/**
 * @project AncestorTree
 * @file src/lib/supabase-data-fund.ts
 * @description Supabase data functions for fund transactions and scholarships
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { supabase } from './supabase';
import { getPaginationRange } from '@constants';
import type {
  FundTransaction,
  FundTransactionsListFilters,
  CreateFundTransactionInput,
  FundBalance,
  PaginatedResult,
  Scholarship,
  ScholarshipsListFilters,
  CreateScholarshipInput,
  ScholarshipStatus,
} from '@types';

// ═══════════════════════════════════════════════════════════════════════════
// Fund Transactions
// ═══════════════════════════════════════════════════════════════════════════

/** Paginated transactions list for admin/history views — never loads the full table. */
export async function getFundTransactions(
  filters: FundTransactionsListFilters
): Promise<PaginatedResult<FundTransaction>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('fund_transactions')
    .select('*', { count: 'exact' })
    .order('transaction_date', { ascending: false });

  if (filters.academicYear) {
    query = query.eq('academic_year', filters.academicYear);
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

/**
 * Full transactions list — export (CSV/PDF report) use only.
 * List UIs must use the paginated `getFundTransactions` instead.
 */
export async function getAllFundTransactions(academicYear?: string): Promise<FundTransaction[]> {
  let query = supabase
    .from('fund_transactions')
    .select('*')
    .order('transaction_date', { ascending: false });

  if (academicYear) {
    query = query.eq('academic_year', academicYear);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

interface FundBalanceRpcResult {
  income: number;
  expense: number;
  balance: number;
}

/** Chunk size for the client-side fallback aggregation below. */
const BALANCE_FALLBACK_CHUNK_SIZE = 1000;

/**
 * Fund income/expense/balance totals.
 * Prefers the `get_fund_balance` SQL RPC (single aggregate query). Falls back
 * to a chunked full-table scan (no row cap — keeps paging until a short page
 * is returned) if the RPC is not available yet (e.g. migration not applied).
 */
export async function getFundBalance(): Promise<FundBalance> {
  const { data, error } = await supabase.rpc('get_fund_balance');
  if (!error && data) {
    const result = data as FundBalanceRpcResult;
    return {
      income: Number(result.income ?? 0),
      expense: Number(result.expense ?? 0),
      balance: Number(result.balance ?? 0),
    };
  }

  let income = 0;
  let expense = 0;
  let from = 0;
  for (;;) {
    const to = from + BALANCE_FALLBACK_CHUNK_SIZE - 1;
    const { data: rows, error: chunkError } = await supabase
      .from('fund_transactions')
      .select('type, amount')
      .range(from, to);

    if (chunkError) throw chunkError;
    if (!rows || rows.length === 0) break;

    for (const tx of rows) {
      if (tx.type === 'income') income += Number(tx.amount);
      else expense += Number(tx.amount);
    }

    if (rows.length < BALANCE_FALLBACK_CHUNK_SIZE) break;
    from += BALANCE_FALLBACK_CHUNK_SIZE;
  }

  return { income, expense, balance: income - expense };
}

export async function createFundTransaction(input: CreateFundTransactionInput): Promise<FundTransaction> {
  const { data, error } = await supabase
    .from('fund_transactions')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFundTransaction(id: string, input: Partial<CreateFundTransactionInput>): Promise<FundTransaction> {
  const { data, error } = await supabase
    .from('fund_transactions')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFundTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('fund_transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════════════════
// Scholarships
// ═══════════════════════════════════════════════════════════════════════════

/** Paginated scholarships list for admin/history views — never loads the full table. */
export async function getScholarships(
  filters: ScholarshipsListFilters
): Promise<PaginatedResult<Scholarship>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('scholarships')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.academicYear) {
    query = query.eq('academic_year', filters.academicYear);
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

/**
 * Full scholarships list — export (CSV/PDF report) use only.
 * List UIs must use the paginated `getScholarships` instead.
 */
export async function getAllScholarships(academicYear?: string): Promise<Scholarship[]> {
  let query = supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false });

  if (academicYear) {
    query = query.eq('academic_year', academicYear);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getScholarship(id: string): Promise<Scholarship | null> {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createScholarship(input: CreateScholarshipInput): Promise<Scholarship> {
  const { data, error } = await supabase
    .from('scholarships')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScholarshipStatus(
  id: string,
  status: ScholarshipStatus,
  approvedBy?: string
): Promise<Scholarship> {
  const updateData: Record<string, unknown> = { status };
  if (status === 'approved') {
    updateData.approved_by = approvedBy;
    updateData.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('scholarships')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScholarship(id: string): Promise<void> {
  const { error } = await supabase
    .from('scholarships')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
