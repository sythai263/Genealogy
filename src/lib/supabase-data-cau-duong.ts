/**
 * @project AncestorTree
 * @file src/lib/supabase-data-cau-duong.ts
 * @description Data layer cho tính năng Lịch Cầu đương
 *   - Quản lý nhóm xoay vòng (pools) và phân công (assignments)
 *   - Thuật toán DFS để xác định thứ tự xoay vòng theo cây gia phả
 *   - Tính tuổi âm và kiểm tra điều kiện đủ tư cách (đã lập gia đình, dưới 70 tuổi âm)
 * @version 1.0.0
 * @updated 2026-02-25
 */

import { supabase } from './supabase';
import type { CauDuongPool, CauDuongAssignment } from '@types';

// ─── Pools CRUD ───────────────────────────────────────────────────────────────

export async function getCauDuongPools(): Promise<CauDuongPool[]> {
  const { data, error } = await supabase
    .from('cau_duong_pools')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getCauDuongPool(id: string): Promise<CauDuongPool | null> {
  const { data, error } = await supabase
    .from('cau_duong_pools')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createCauDuongPool(
  input: Omit<CauDuongPool, 'id' | 'created_at' | 'updated_at'>,
): Promise<CauDuongPool> {
  const { data, error } = await supabase
    .from('cau_duong_pools')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCauDuongPool(
  id: string,
  input: Partial<Omit<CauDuongPool, 'id' | 'created_at' | 'updated_at'>>,
): Promise<CauDuongPool> {
  const { data, error } = await supabase
    .from('cau_duong_pools')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Assignments CRUD ─────────────────────────────────────────────────────────

export async function getCauDuongAssignments(
  poolId: string,
  year?: number,
): Promise<CauDuongAssignment[]> {
  let query = supabase
    .from('cau_duong_assignments')
    .select('*')
    .eq('pool_id', poolId)
    .order('year', { ascending: false })
    .order('ceremony_type', { ascending: true });

  if (year !== undefined) {
    query = query.eq('year', year);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createCauDuongAssignment(
  input: Omit<CauDuongAssignment, 'id' | 'created_at' | 'updated_at'>,
): Promise<CauDuongAssignment> {
  const { data, error } = await supabase
    .from('cau_duong_assignments')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCauDuongAssignment(
  id: string,
  input: Partial<Omit<CauDuongAssignment, 'id' | 'created_at' | 'updated_at'>>,
): Promise<CauDuongAssignment> {
  const { data, error } = await supabase
    .from('cau_duong_assignments')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

