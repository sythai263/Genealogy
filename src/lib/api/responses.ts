/**
 * @project AncestorTree
 * @file src/lib/api/responses.ts
 * @description Standard response builders for API route handlers
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { NextResponse } from 'next/server';
import { API_ERROR_MESSAGES, API_STATUS } from '@constants';
import type { ApiErrorBody, ApiFileOptions } from '@types';

/** JSON success response — keeps the existing flat payload shape */
export function apiOk<TData>(data: TData, init?: ResponseInit): NextResponse<TData> {
  return NextResponse.json(data, init);
}

/** JSON error response — every route returns this exact `{ error }` shape */
export function apiError(
  message: string,
  status: number = API_STATUS.serverError
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: message }, { status });
}

/** Binary/text file response with optional attachment disposition */
export function apiFile(
  body: BodyInit,
  { contentType, filename, cacheControl }: ApiFileOptions,
  init?: ResponseInit
): NextResponse {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', contentType);
  if (filename) {
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  }
  if (cacheControl) {
    headers.set('Cache-Control', cacheControl);
  }
  return new NextResponse(body, { ...init, headers });
}

/** Narrow an unknown thrown value to a readable message */
export function toErrorMessage(
  error: unknown,
  fallback: string = API_ERROR_MESSAGES.serverError
): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}
