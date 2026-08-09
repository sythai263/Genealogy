/**
 * @project AncestorTree
 * @file src/app/api/media/[...path]/route.ts
 * @description Local media file server for desktop mode.
 *              Serves files from ~/AncestorTree/media/ and handles upload/delete.
 *              MUST return 404 in web mode to prevent unintended file serving.
 * @version 2.0.0
 * @updated 2026-08-09
 * @security SEC-CRIT-01: file size limit enforced (50MB max)
 * @security SEC-CRIT-02: MIME type allowlist enforced on upload
 */

import fs from 'fs';
import path from 'path';
import {
  API_ERROR_MESSAGES,
  API_STATUS,
  MEDIA_API_ALLOWED_MIME_TYPES,
  MEDIA_API_MAX_FILE_SIZE,
  MEDIA_DESKTOP_ROOT,
} from '@constants';
import {
  apiError,
  apiFile,
  apiOk,
  guardDesktopOnly,
  mimeTypeForPath,
  resolveSafePath,
  validateUpload,
  withApiHandler,
} from '@lib/api';
import type { ApiRouteContext } from '@types';

interface MediaParams {
  path: string[];
}

/**
 * Shared preamble for all three handlers: desktop-mode guard + path traversal
 * guard. Returns the resolved absolute path, or a Response to short-circuit.
 */
async function resolveMediaPath(
  context: ApiRouteContext<MediaParams>
): Promise<{ filePath: string; segments: string[] } | Response> {
  const guard = guardDesktopOnly();
  if (guard) return guard;

  const { path: segments } = await context.params;
  const filePath = resolveSafePath(MEDIA_DESKTOP_ROOT, segments);
  if (!filePath) {
    return apiError(API_ERROR_MESSAGES.forbidden, API_STATUS.forbidden);
  }

  return { filePath, segments };
}

/** GET /api/media/[...path] — serve a local media file */
export const GET = withApiHandler<MediaParams>('media/get', async (_request, context) => {
  const resolved = await resolveMediaPath(context);
  if (resolved instanceof Response) return resolved;

  if (!fs.existsSync(resolved.filePath)) {
    return apiError(API_ERROR_MESSAGES.notFound, API_STATUS.notFound);
  }

  return apiFile(new Uint8Array(fs.readFileSync(resolved.filePath)), {
    contentType: mimeTypeForPath(resolved.filePath),
    cacheControl: 'no-cache',
  });
});

/** POST /api/media/[...path] — upload a file */
export const POST = withApiHandler<MediaParams>('media/post', async (request, context) => {
  const resolved = await resolveMediaPath(context);
  if (resolved instanceof Response) return resolved;

  const formData = await request.formData();
  const file = formData.get('file');
  const uploadError = validateUpload(file instanceof File ? file : null, {
    maxSize: MEDIA_API_MAX_FILE_SIZE,
    allowedMimeTypes: MEDIA_API_ALLOWED_MIME_TYPES,
  });
  if (uploadError) return uploadError;

  const dir = path.dirname(resolved.filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const arrayBuffer = await (file as File).arrayBuffer();
  fs.writeFileSync(resolved.filePath, Buffer.from(arrayBuffer));

  return apiOk({ ok: true, path: resolved.segments.join('/') });
});

/** DELETE /api/media/[...path] — delete a file */
export const DELETE = withApiHandler<MediaParams>('media/delete', async (_request, context) => {
  const resolved = await resolveMediaPath(context);
  if (resolved instanceof Response) return resolved;

  if (fs.existsSync(resolved.filePath)) {
    fs.unlinkSync(resolved.filePath);
  }

  return apiOk({ ok: true });
});
