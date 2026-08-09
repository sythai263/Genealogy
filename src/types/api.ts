/**
 * @project AncestorTree
 * @file src/types/api.ts
 * @description Shared types for API route handlers and HTTP clients
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { NextRequest } from 'next/server';
import type { UserRole } from './profile';

/** Flat error body returned by every JSON API route */
export interface ApiErrorBody {
  error: string;
}

/** Route context passed by Next.js as the second handler argument */
export interface ApiRouteContext<TParams = Record<string, string | string[]>> {
  params: Promise<TParams>;
}

/** Signature of a route handler wrapped by `withApiHandler` */
export type ApiHandler<TParams = Record<string, string | string[]>> = (
  request: NextRequest,
  context: ApiRouteContext<TParams>
) => Promise<Response> | Response;

/** Result of a successful role guard */
export interface AuthorizedRequester {
  userId: string;
  role: UserRole;
}

/** Options accepted by `validateUpload` */
export interface UploadValidationOptions {
  maxSize: number;
  allowedMimeTypes?: ReadonlySet<string>;
}

/** Options accepted by `apiFile` */
export interface ApiFileOptions {
  contentType: string;
  filename?: string;
  cacheControl?: string;
}
