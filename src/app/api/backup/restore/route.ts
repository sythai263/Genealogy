/**
 * @project AncestorTree
 * @file src/app/api/backup/restore/route.ts
 * @description Restore API — imports a ZIP backup file into the database via the
 *              Supabase service-role client.
 *              DESTRUCTIVE: clears all table data before restoring.
 * @version 3.1.0
 * @updated 2026-08-09
 * @security SEC-CRIT-03: table names whitelisted; column keys restricted to
 *          plain identifiers — PostgREST inserts are parameterised so no SQL
 *          is ever concatenated.
 * @security SEC-WARN-04: ZIP file size limited to 500 MB
 */

import {
    API_ERROR_MESSAGES,
    API_STATUS,
    BACKUP_DELETE_ORDER,
    BACKUP_EXPORT_TABLES,
    BACKUP_INSERT_BATCH_SIZE,
    BACKUP_MAX_IMPORT_SIZE,
    BACKUP_UPSERT_KEYS,
} from '@constants';
import { parseBackupManifest, toBackupRows } from '@lib';
import {
    apiError,
    apiOk,
    createServiceRoleClient,
    requireRole,
    validateUpload,
    withApiHandler,
} from '@lib/api';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BackupRow, RestoreResult } from '@types';
import AdmZip from 'adm-zip';

function readRows(zip: AdmZip, table: string): BackupRow[] | null {
  const entry = zip.getEntry(`data/${table}.json`);
  if (!entry) return null;
  try {
    const parsed = JSON.parse(entry.getData().toString('utf-8'));
    return toBackupRows(parsed);
  } catch {
    return null;
  }
}

/**
 * Inserts rows in batches; on a batch failure falls back to row-by-row so a
 * single bad row (e.g. a dangling FK to a missing auth user) does not sink
 * the rest of the table.
 */
async function insertRows(
  supabase: SupabaseClient,
  table: string,
  rows: BackupRow[],
  errors: string[]
): Promise<number> {
  let inserted = 0;

  for (let start = 0; start < rows.length; start += BACKUP_INSERT_BATCH_SIZE) {
    const batch = rows.slice(start, start + BACKUP_INSERT_BATCH_SIZE);
    const conflictKey = BACKUP_UPSERT_KEYS[table];

    const { error } = conflictKey
      ? await supabase.from(table).upsert(batch, { onConflict: conflictKey })
      : await supabase.from(table).insert(batch);

    if (!error) {
      inserted += batch.length;
      continue;
    }

    for (const row of batch) {
      const { error: rowError } = conflictKey
        ? await supabase.from(table).upsert(row, { onConflict: conflictKey })
        : await supabase.from(table).insert(row);
      if (rowError) {
        errors.push(`${table}: ${rowError.message}`);
      } else {
        inserted += 1;
      }
    }
  }

  return inserted;
}

export const POST = withApiHandler(
  'backup/restore',
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

    const formData = await request.formData();
    const file = formData.get('file');

    const uploadError = validateUpload(file instanceof File ? file : null, {
      maxSize: BACKUP_MAX_IMPORT_SIZE,
    });
    if (uploadError) return uploadError;

    let zip: AdmZip;
    try {
      const arrayBuffer = await (file as File).arrayBuffer();
      zip = new AdmZip(Buffer.from(arrayBuffer));
    } catch {
      return apiError('File không phải định dạng ZIP', API_STATUS.badRequest);
    }

    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      return apiError(
        'File không hợp lệ: thiếu manifest.json',
        API_STATUS.badRequest
      );
    }

    const manifest = parseBackupManifest(manifestEntry.getData().toString('utf-8'));
    if (!manifest) {
      return apiError('Định dạng manifest không hợp lệ', API_STATUS.badRequest);
    }

    const errors: string[] = [];

    // Phase 1: wipe data tables in FK-safe order (children before parents).
    // profiles + clan_settings are upserted later instead of being deleted.
    for (const table of BACKUP_DELETE_ORDER) {
      const { error } = await supabase
        .from(table)
        .delete()
        .not('id', 'is', null);
      if (error) errors.push(`${table} (delete): ${error.message}`);
    }

    // Phase 2: insert tables in FK-safe order (parents before children)
    const tables: Record<string, number> = {};
    let totalInserted = 0;

    for (const table of BACKUP_EXPORT_TABLES) {
      const rows = readRows(zip, table);
      if (rows === null) {
        errors.push(`${table}: thiếu hoặc lỗi data/${table}.json`);
        tables[table] = 0;
        continue;
      }
      const inserted = await insertRows(supabase, table, rows, errors);
      tables[table] = inserted;
      totalInserted += inserted;
    }

    const result: RestoreResult = {
      total_inserted: totalInserted,
      tables,
      ...(errors.length > 0 ? { errors } : {}),
    };

    return apiOk(result);
  },
  API_ERROR_MESSAGES.restoreFailed
);
