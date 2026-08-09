/**
 * @project AncestorTree
 * @file src/app/api/backup/route.ts
 * @description Backup API — exports all 13 tables to a single ZIP file using the
 *              service-role client to bypass RLS.
 * @version 3.0.0
 * @updated 2026-08-09
 */

import AdmZip from 'adm-zip';
import {
  APP_VERSION,
  API_ERROR_MESSAGES,
  BACKUP_EXPORT_TABLES,
} from '@constants';
import { apiFile, withApiHandler } from '@lib/api';

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
  async () => {
    const zip = new AdmZip();
    const exportedData: Record<string, unknown[]> = {};

    const manifest = {
      version: '1.0',
      app_version: APP_VERSION,
      exported_at: new Date().toISOString(),
      row_counts: Object.fromEntries(
        BACKUP_EXPORT_TABLES.map((table) => [table, exportedData[table].length])
      ),
      tables: exportedData,
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
