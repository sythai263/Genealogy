/**
 * @project AncestorTree
 * @file src/lib/api/handler.ts
 * @description try/catch wrapper that normalises logging and 500 responses
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { NextRequest } from 'next/server';
import { API_ERROR_MESSAGES, API_STATUS } from '@constants';
import type { ApiHandler, ApiRouteContext } from '@types';
import { apiError, toErrorMessage } from './responses';

/**
 * Wraps a route handler so unexpected throws are logged server-side and the
 * client only ever receives `clientMessage` — internal details never leak.
 */
export function withApiHandler<TParams = Record<string, string | string[]>>(
  name: string,
  handler: ApiHandler<TParams>,
  clientMessage: string = API_ERROR_MESSAGES.serverError
): ApiHandler<TParams> {
  return async function wrappedHandler(
    request: NextRequest,
    context: ApiRouteContext<TParams>
  ): Promise<Response> {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(`[${name}]`, toErrorMessage(error));
      return apiError(clientMessage, API_STATUS.serverError);
    }
  };
}
