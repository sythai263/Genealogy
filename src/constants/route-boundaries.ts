/**
 * @project AncestorTree
 * @file src/constants/route-boundaries.ts
 * @description Route error title keys — copy lives in Common.routeErrors (next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { vi } from '@messages/vi';

/** @deprecated Prefer getTranslations('Common').routeErrors.* */
export const ROUTE_ERROR_TITLES = vi.Common.routeErrors;

/** @deprecated Prefer Common.notFound.* */
export const NOT_FOUND_TITLE = vi.Common.notFound.title;
export const NOT_FOUND_DESCRIPTION = vi.Common.notFound.description;
export const NOT_FOUND_HOME_LABEL = vi.Common.notFound.homeLabel;
export const PERSON_NOT_FOUND_TITLE = vi.Common.notFound.personTitle;
export const PERSON_NOT_FOUND_DESCRIPTION = vi.Common.notFound.personDescription;
