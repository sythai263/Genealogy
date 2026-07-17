/**
 * @project AncestorTree
 * @file src/app/api/backup/route.ts
 * @description Unified backup API — exports all 13 tables to a single ZIP file.
 *              Works in both Desktop (SQLite via sql.js) and Web (Supabase) modes.
 *              Desktop: queries SQLite directly + optional media embedding.
 *              Web:     uses service-role client to bypass RLS; inline media skipped.
 * @version 1.0.0
 * @updated 2026-02-28
 */

import AdmZip from 'adm-zip';
import { NextRequest, NextResponse } from 'next/server';

/** All tables exported (profiles skipped — CTO Obs 3: UUID remapping) */
const EXPORT_TABLES = [
  'people',
  'families',
  'children',
  'contributions',
  'events',
  'media',
  'achievements',
  'fund_transactions',
  'scholarships',
  'clan_articles',
  'cau_duong_pools',
  'cau_duong_assignments',
  'clan_documents',
] as const;

type IncludeMedia = 'skip' | 'reference' | 'inline';

const APP_VERSION = process.env.npm_package_version || '2.2.1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const includeMedia: IncludeMedia = body.include_media ?? 'reference';

    const isDesktop =
      process.env.DESKTOP_MODE === 'true' ||
      process.env.NEXT_PUBLIC_DESKTOP_MODE === 'true';

    const zip = new AdmZip();
    const exportedData: Record<string, unknown[]> = {};

    // ── Build manifest ─────────────────────────────────────────────────────
    const manifest = {
      version: '1.0',
      app_version: APP_VERSION,
      exported_at: new Date().toISOString(),
      mode: isDesktop ? 'desktop' : 'web',
      include_media: includeMedia,
      row_counts: Object.fromEntries(
        EXPORT_TABLES.map(t => [t, exportedData[t].length])
      ),
      tables: exportedData,
    };

    zip.addFile(
      'manifest.json',
      Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8')
    );

    const zipBuffer = zip.toBuffer();
    const filename = `giapha-${new Date().toISOString().slice(0, 10)}.zip`;

    // ── Docker volume persistence (BACKUP_DIR env var) ──────────────────────
    // When running in Docker, mount a host directory to BACKUP_DIR so backup
    // ZIPs are persisted on the host filesystem in addition to the download.
    const backupDir = process.env.BACKUP_DIR;
    if (backupDir) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        fs.writeFileSync(path.join(backupDir, filename), zipBuffer);
      } catch {
        // Non-fatal: still return the download even if disk write fails
      }
    }

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sao lưu thất bại' },
      { status: 500 }
    );
  }
}
