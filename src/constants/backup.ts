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
  'member_registrations',
  'posts',
  'post_comments',
  'post_likes',
  'notifications',
  'profiles',
  'clan_settings',
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

/** Backup manifest format version written by POST /api/backup */
export const BACKUP_FORMAT_VERSION = '2.0';

/**
 * All tables exported in the backup ZIP.
 * Order = FK-safe insert order (parents before children).
 * `profiles` goes first because contributions/posts/clan_articles reference it.
 */
export const BACKUP_EXPORT_TABLES = [
  'profiles',
  'people',
  'families',
  'children',
  'cau_duong_pools',
  'cau_duong_assignments',
  'clan_articles',
  'achievements',
  'fund_transactions',
  'scholarships',
  'events',
  'media',
  'clan_documents',
  'member_registrations',
  'contributions',
  'posts',
  'post_comments',
  'post_likes',
  'notifications',
  'clan_settings',
] as const;

/**
 * Tables restored via upsert instead of delete+insert.
 * `profiles` is keyed on user_id and tied to auth.users — deleting it would
 * strip roles from live accounts (including the admin running the restore).
 * `clan_settings` is a singleton row.
 */
export const BACKUP_UPSERT_KEYS: Readonly<Record<string, string>> = {
  profiles: 'user_id',
  clan_settings: 'id',
};

/**
 * FK-safe delete order (children before parents). Runs before inserts so a
 * restore fully replaces existing data. Auth-linked singletons
 * (profiles, clan_settings) are intentionally absent — they are upserted.
 */
export const BACKUP_DELETE_ORDER = [
  'notifications',
  'post_likes',
  'post_comments',
  'posts',
  'contributions',
  'member_registrations',
  'clan_documents',
  'media',
  'events',
  'scholarships',
  'fund_transactions',
  'achievements',
  'clan_articles',
  'cau_duong_assignments',
  'cau_duong_pools',
  'children',
  'families',
  'people',
] as const;

/** Rows per PostgREST insert batch */
export const BACKUP_INSERT_BATCH_SIZE = 500;
