/**
 * @project AncestorTree
 * @file src/services/backup.ts
 * @description Client-side calls to the backup export/restore API routes
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { API_ERROR_MESSAGES } from '@constants';
import type { IncludeMedia, RestoreResult } from '@types';
import { downloadBlob, requestBlob, requestJson } from './http';

export async function exportBackup(includeMedia: IncludeMedia): Promise<Blob> {
  return requestBlob(
    '/api/backup',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ include_media: includeMedia }),
    },
    API_ERROR_MESSAGES.backupFailed
  );
}

export function downloadBackupBlob(blob: Blob): void {
  downloadBlob(blob, `giapha-${new Date().toISOString().slice(0, 10)}.zip`);
}

export async function restoreBackup(file: File): Promise<RestoreResult> {
  const formData = new FormData();
  formData.append('file', file);

  return requestJson<RestoreResult>(
    '/api/backup/restore',
    { method: 'POST', body: formData },
    API_ERROR_MESSAGES.restoreFailed
  );
}
