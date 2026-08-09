/**
 * @project AncestorTree
 * @file src/app/api/backup/restore/route.ts
 * @description Restore API — imports a ZIP backup file into the database via the
 *              Supabase service-role client.
 *              DESTRUCTIVE: clears all table data before restoring from manifest.
 * @version 3.0.0
 * @updated 2026-08-09
 * @security SEC-CRIT-03: column names whitelisted per table (prevents SQL injection)
 * @security SEC-WARN-04: ZIP file size limited to 500 MB
 */

import AdmZip from 'adm-zip';
import {
  API_ERROR_MESSAGES,
  API_STATUS,
  BACKUP_MAX_IMPORT_SIZE,
} from '@constants';
import { apiError, validateUpload, withApiHandler } from '@lib/api';

interface BackupManifest {
  version?: string;
  tables?: Record<string, unknown[]>;
}

export const POST = withApiHandler(
  'backup/restore',
  async (request) => {
    const formData = await request.formData();
    const file = formData.get('file');

    const uploadError = validateUpload(file instanceof File ? file : null, {
      maxSize: BACKUP_MAX_IMPORT_SIZE,
    });
    if (uploadError) return uploadError;

    const arrayBuffer = await (file as File).arrayBuffer();
    const zip = new AdmZip(Buffer.from(arrayBuffer));

    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      return apiError(
        'File không hợp lệ: thiếu manifest.json',
        API_STATUS.badRequest
      );
    }

    const manifest = JSON.parse(
      manifestEntry.getData().toString('utf-8')
    ) as BackupManifest;

    if (!manifest.version || !manifest.tables) {
      return apiError('Định dạng manifest không hợp lệ', API_STATUS.badRequest);
    }

    // The table-restore step is not implemented yet; fail loudly rather than
    // reporting success for a backup that was never written to the database.
    return apiError(API_ERROR_MESSAGES.notImplemented, API_STATUS.notImplemented);
  },
  API_ERROR_MESSAGES.restoreFailed
);
