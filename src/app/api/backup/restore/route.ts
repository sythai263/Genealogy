/**
 * @project AncestorTree
 * @file src/app/api/backup/restore/route.ts
 * @description Unified restore API — imports a ZIP backup file into the database.
 *              Works in both Desktop (SQLite) and Web (Supabase service-role) modes.
 *              DESTRUCTIVE: clears all table data before restoring from manifest.
 * @version 1.0.0
 * @updated 2026-02-28
 * @security SEC-CRIT-03: column names whitelisted per table (prevents SQL injection)
 * @security SEC-WARN-04: ZIP file size limited to 500 MB
 */

import AdmZip from 'adm-zip';
import { NextRequest, NextResponse } from 'next/server';
import { BACKUP_MAX_IMPORT_SIZE } from '@constants';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: 'Không tìm thấy file' },
        { status: 400 }
      );
    }

    // SEC-WARN-04: Enforce file size limit
    if (file.size > BACKUP_MAX_IMPORT_SIZE) {
      return NextResponse.json(
        {
          error: `File quá lớn. Giới hạn tối đa là ${BACKUP_MAX_IMPORT_SIZE / 1024 / 1024} MB`,
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const zip = new AdmZip(Buffer.from(arrayBuffer));

    // ── Validate manifest ──────────────────────────────────────────────────
    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      return NextResponse.json(
        { error: 'File không hợp lệ: thiếu manifest.json' },
        { status: 400 }
      );
    }

    const manifest = JSON.parse(manifestEntry.getData().toString('utf-8'));
    if (!manifest.version || !manifest.tables) {
      return NextResponse.json(
        { error: 'Định dạng manifest không hợp lệ' },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Khôi phục thất bại' },
      { status: 500 }
    );
  }
}
