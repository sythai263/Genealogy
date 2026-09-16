/**
 * @project AncestorTree
 * @file src/app/api/backup/route.ts
 * @description Backup API — exports all data tables to a single ZIP file using
 *              the service-role client to bypass RLS. Admin/editor only.
 * @version 3.1.0
 * @updated 2026-08-09
 */

import {
    API_ERROR_MESSAGES,
    API_STATUS,
    APP_VERSION,
    BACKUP_EXPORT_TABLES,
    BACKUP_FORMAT_VERSION,
} from '@constants';
import {
    apiError,
    apiFile,
    createServiceRoleClient,
    requireRole,
    withApiHandler,
} from '@lib/api';
import type { BackupRow } from '@types';
import AdmZip from 'adm-zip';

/**
 * Docker volume persistence: when BACKUP_DIR is mounted, keep a copy of the ZIP
 * on the host filesystem in addition to sending the download. Never fatal.
 */
async function persistToBackupDir(filename: string, zipBuffer: Buffer): Promise<void> {
  const backupDir = process.env.BACKUP_DIR;
  if (!backupDir) return;

  try {
    const fs = await import('fs');
    const path = await import('path');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(path.join(backupDir, filename), zipBuffer);
  } catch {
    // Non-fatal: still return the download even if the disk write fails
  }
}

export const POST = withApiHandler(
  'backup/export',
  async (request) => {
    const requester = await requireRole(request);
    if (requester instanceof Response) return requester;

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return apiError(
        API_ERROR_MESSAGES.serverMisconfigured,
        API_STATUS.serverError
      );
    }

    const zip = new AdmZip();
    const rowCounts: Record<string, number> = {};

    for (const table of BACKUP_EXPORT_TABLES) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;

      const rows = (data ?? []) as BackupRow[];
      rowCounts[table] = rows.length;
      zip.addFile(
        `data/${table}.json`,
        Buffer.from(JSON.stringify(rows, null, 2), 'utf-8')
      );
    }

    const manifest = {
      version: BACKUP_FORMAT_VERSION,
      app_version: APP_VERSION,
      exported_at: new Date().toISOString(),
      row_counts: rowCounts,
    };

    zip.addFile(
      'manifest.json',
      Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8')
    );

    const zipBuffer = zip.toBuffer();
    const filename = `giapha-${new Date().toISOString().slice(0, 10)}.zip`;

    await persistToBackupDir(filename, zipBuffer);

    return apiFile(new Uint8Array(zipBuffer), {
      contentType: 'application/zip',
      filename,
    });
  },
  API_ERROR_MESSAGES.backupFailed
);
