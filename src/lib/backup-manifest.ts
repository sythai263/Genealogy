/**
 * @project AncestorTree
 * @file src/lib/backup-manifest.ts
 * @description Backup ZIP manifest validation + row sanitisation for restore
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { BACKUP_EXPORT_TABLES, BACKUP_FORMAT_VERSION } from '@constants';
import type { BackupManifest, BackupRow } from '@types';

const ALLOWED_TABLES = new Set<string>(BACKUP_EXPORT_TABLES);
const COLUMN_KEY_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** Parse + validate manifest.json — returns null when malformed */
export function parseBackupManifest(raw: string): BackupManifest | null {
  try {
    const parsed = JSON.parse(raw) as Partial<BackupManifest>;
    if (
      parsed.version !== BACKUP_FORMAT_VERSION ||
      typeof parsed.exported_at !== 'string' ||
      !parsed.row_counts ||
      typeof parsed.row_counts !== 'object' ||
      parsed.row_counts === null
    ) {
      return null;
    }
    for (const key of Object.keys(parsed.row_counts)) {
      if (!ALLOWED_TABLES.has(key)) return null;
    }
    return parsed as BackupManifest;
  } catch {
    return null;
  }
}

/** Keep only safe identifier keys — strips anything that is not a plain column name */
export function sanitizeBackupRow(row: BackupRow): BackupRow {
  const clean: BackupRow = {};
  for (const [key, value] of Object.entries(row)) {
    if (COLUMN_KEY_PATTERN.test(key)) clean[key] = value;
  }
  return clean;
}

/** Narrows a parsed JSON value to an array of backup rows */
export function toBackupRows(value: BackupRow[] | BackupRow | object | null): BackupRow[] | null {
  if (!Array.isArray(value)) return null;
  return value.map((row) => sanitizeBackupRow(row as BackupRow));
}
