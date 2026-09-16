/**
 * @project AncestorTree
 * @file src/services/backup.ts
 * @description Client-side calls to the backup export/restore API routes
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { API_ERROR_MESSAGES } from '@constants';
import { supabase } from '@lib';
import type { RestoreResult } from '@types';
import { downloadBlob, requestBlob, requestJson } from './http';

/**
 * API routes guard with `requireRole`, which expects a Bearer token — the
 * browser session lives in cookies so the access token is attached manually.
 */
async function authHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error(API_ERROR_MESSAGES.unauthorized);
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function exportBackup(): Promise<Blob> {
  return requestBlob(
    '/api/backup',
    { method: 'POST', headers: await authHeaders() },
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
    {
      method: 'POST',
      body: formData,
      headers: await authHeaders(),
    },
    API_ERROR_MESSAGES.restoreFailed
  );
}
