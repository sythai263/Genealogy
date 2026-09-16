export type BackupInterval = 'off' | 'daily' | 'weekly' | 'monthly';

export interface BackupSchedule {
  interval: BackupInterval;
  /** ISO string of last successful backup, or null if never */
  lastBackupAt: string | null;
  /** Auto-download when backup is due (on page load) */
  autoDownload: boolean;
}

export interface RestoreResult {
  total_inserted: number;
  tables: Record<string, number>;
  errors?: string[];
}

/** A single exported table row — JSON-shaped, keys validated before insert */
export type BackupRow = Record<
  string,
  string | number | boolean | object | null
>;

/** manifest.json schema inside the backup ZIP */
export interface BackupManifest {
  version: string;
  app_version?: string;
  exported_at: string;
  row_counts: Record<string, number>;
}
