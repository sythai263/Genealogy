/**
 * @project AncestorTree
 * @file src/types/directory.ts
 * @description Types for family directory contact display and filters
 * @version 1.0.0
 * @updated 2026-07-18
 */

export type DirectoryGenderFilter = 'all' | '1' | '2';
export type DirectoryStatusFilter = 'all' | 'living' | 'deceased';

export interface DirectoryContactDisplay {
  phone: string | null;
  email: string | null;
  address: string | null;
  zalo: string | null;
  facebook: string | null;
  masked: boolean;
}
