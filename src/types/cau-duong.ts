/**
 * @project AncestorTree
 * @file src/types/cau-duong.ts
 * @description Type definitions for Cầu đương (pools, assignments, eligibility)
 * @version 1.1.0
 * @updated 2026-07-18
 */

import type { Person } from './person';

export interface CauDuongPool {
  id: string;
  name: string;
  ancestor_id: string;
  min_generation: number;
  max_age_lunar: number;
  require_married: boolean;
  custom_order?: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CauDuongCeremonyType =
  | 'tet'
  | 'ram_thang_gieng'
  | 'gio_to'
  | 'ram_thang_bay';

export type CauDuongStatus =
  | 'scheduled'
  | 'completed'
  | 'delegated'
  | 'rescheduled'
  | 'cancelled';

export interface CauDuongAssignment {
  id: string;
  pool_id: string;
  year: number;
  ceremony_type: CauDuongCeremonyType;
  host_person_id?: string;
  actual_host_person_id?: string;
  status: CauDuongStatus;
  scheduled_date?: string;
  actual_date?: string;
  reason?: string;
  notes?: string;
  rotation_index?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CauDuongAssignmentWithPeople extends CauDuongAssignment {
  host_person: Person | null;
  actual_host_person: Person | null;
}

/** Thành viên đủ điều kiện làm Cầu đương (kết quả DFS) */
export interface CauDuongEligibleMember {
  person: Person;
  dfsIndex: number;
  ageLunar: number;
  isMarried: boolean;
}
