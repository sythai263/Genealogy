/**
 * @project AncestorTree
 * @file src/app/api/media/[...path]/route.ts
 * @description Local media file server for desktop mode.
 *              Serves files from ~/AncestorTree/media/ and handles upload/delete.
 *              MUST return 404 in web mode to prevent unintended file serving.
 * @version 1.1.0
 * @updated 2026-02-27
 * @security SEC-CRIT-01: file size limit enforced (50MB max)
 * @security SEC-CRIT-02: MIME type allowlist enforced on upload
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import {
  MEDIA_API_ALLOWED_MIME_TYPES,
  MEDIA_API_MAX_FILE_SIZE,
  MEDIA_DESKTOP_ROOT,
} from '@constants';

/**
 * CTO Obs 4: Web-mode guard — this route ONLY serves in desktop mode.
 * In web mode, media is served from Supabase Storage, not local filesystem.
 */
function guardDesktopOnly(): NextResponse | null {
  if (process.env.NEXT_PUBLIC_DESKTOP_MODE !== 'true') {
    return NextResponse.json(
      { error: 'This endpoint is only available in desktop mode' },
      { status: 404 }
    );
  }
  return null;
}

/**
 * Path traversal guard — prevents accessing files outside MEDIA_DESKTOP_ROOT.
 */
function resolveSafePath(segments: string[]): string | null {
  const resolved = path.resolve(MEDIA_DESKTOP_ROOT, ...segments);
  if (!resolved.startsWith(MEDIA_DESKTOP_ROOT + path.sep) && resolved !== MEDIA_DESKTOP_ROOT) {
    return null;
  }
  return resolved;
}

/** GET /api/media/[...path] — serve a local media file */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const guard = guardDesktopOnly();
  if (guard) return guard;

  const { path: segments } = await params;
  const filePath = resolveSafePath(segments);
  if (!filePath) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

/** POST /api/media/[...path] — upload a file (Phase 2: full implementation) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const guard = guardDesktopOnly();
  if (guard) return guard;

  const { path: segments } = await params;
  const filePath = resolveSafePath(segments);
  if (!filePath) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // SEC-CRIT-01: Enforce file size limit
  if (file.size > MEDIA_API_MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MEDIA_API_MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 413 }
    );
  }

  // SEC-CRIT-02: Enforce MIME type allowlist
  if (!MEDIA_API_ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `File type '${file.type}' is not allowed` },
      { status: 415 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  return NextResponse.json({ ok: true, path: segments.join('/') });
}

/** DELETE /api/media/[...path] — delete a file (Phase 2: full implementation) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const guard = guardDesktopOnly();
  if (guard) return guard;

  const { path: segments } = await params;
  const filePath = resolveSafePath(segments);
  if (!filePath) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return NextResponse.json({ ok: true });
}
