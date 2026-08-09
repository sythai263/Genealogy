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
