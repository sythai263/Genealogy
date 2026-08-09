import type { BackupInterval } from '@types';

/** Table keys included in backup restore summary (labels via Admin.backup.tables) */
export const BACKUP_TABLE_KEYS = [
  'people',
  'families',
  'children',
  'contributions',
  'events',
  'media',
  'achievements',
  'fund_transactions',
  'scholarships',
  'clan_articles',
  'cau_duong_pools',
  'cau_duong_assignments',
  'clan_documents',
] as const;

export type BackupTableKey = (typeof BACKUP_TABLE_KEYS)[number];

/** Interval keys for schedule UI (labels via Admin.backup.intervals) */
export const BACKUP_INTERVALS: BackupInterval[] = [
  'off',
  'daily',
  'weekly',
  'monthly',
];

/** 500 MB max backup import file */
export const BACKUP_MAX_IMPORT_SIZE = 500 * 1024 * 1024;

/** All tables exported in backup ZIP (profiles skipped — UUID remapping) */
export const BACKUP_EXPORT_TABLES = [
  'people',
  'families',
  'children',
  'contributions',
  'events',
  'media',
  'achievements',
  'fund_transactions',
  'scholarships',
  'clan_articles',
  'cau_duong_pools',
  'cau_duong_assignments',
  'clan_documents',
] as const;
