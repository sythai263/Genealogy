/**
 * @project AncestorTree
 * @file src/services/http.ts
 * @description Shared fetch wrappers that unwrap the flat `{ error }` API shape
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { API_ERROR_MESSAGES } from '@constants';
import type { ApiErrorBody } from '@types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

/** Throws `Error(message)` built from the API's `{ error }` body when not ok */
export async function requestJson<TData>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallback: string = API_ERROR_MESSAGES.serverError
): Promise<TData> {
  const response = await fetch(input, init);
  const data = (await response.json().catch(() => null)) as
    | (TData & Partial<ApiErrorBody>)
    | null;

  if (!response.ok) {
    throw new Error(data?.error || fallback);
  }
  if (data === null) {
    throw new Error(fallback);
  }

  return data;
}

/** Same contract as `requestJson`, for endpoints that stream a file back */
export async function requestBlob(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallback: string = API_ERROR_MESSAGES.serverError
): Promise<Blob> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallback));
  }

  return response.blob();
}

/** Triggers a browser download for an in-memory blob */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
