/**
 * @project AncestorTree
 * @file src/constants/ui-states.ts
 * @description Shared layout classes and skeleton recipes (labels live in next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { PageSkeletonVariant, SkeletonSpec } from '@types';

/** Standard page shell used by every route under (main) */
export const PAGE_CONTAINER_CLASS = 'container mx-auto space-y-6 px-4 py-8';

/** Narrow shell for single-column reading surfaces (feed, notifications) */
export const PAGE_CONTAINER_NARROW_CLASS =
  'container mx-auto max-w-2xl space-y-6 px-4 py-8';

/** @deprecated Use next-intl Common.retry — kept for gradual migration */
export const UI_RETRY_LABEL = 'Thử lại';
/** @deprecated Use next-intl Common.errorTitle */
export const UI_ERROR_DEFAULT_TITLE = 'Đã xảy ra lỗi';
/** @deprecated Use next-intl Common.errorFallback */
export const UI_ERROR_FALLBACK_MESSAGE = 'Đã xảy ra lỗi. Vui lòng thử lại.';
/** @deprecated Use next-intl Common.empty */
export const UI_EMPTY_DEFAULT_TITLE = 'Chưa có dữ liệu';

/** @deprecated Use next-intl Common.accessDenied.title */
export const ACCESS_DENIED_TITLE = 'Không đủ quyền truy cập';
/** @deprecated Use next-intl Common.accessDenied.editorMessage */
export const ACCESS_DENIED_EDITOR_MESSAGE =
  'Bạn cần quyền biên tập viên để truy cập trang này.';
/** @deprecated Use next-intl Common.accessDenied.adminMessage */
export const ACCESS_DENIED_ADMIN_MESSAGE =
  'Bạn cần quyền quản trị viên để truy cập trang này.';
export const ACCESS_DENIED_HOME_HREF = '/admin';
/** @deprecated Use next-intl Common.accessDenied.homeLabel */
export const ACCESS_DENIED_HOME_LABEL = 'Về bảng quản trị';

export const SKELETON_TITLE_CLASS = 'h-8 w-48';
export const SKELETON_SUBTITLE_CLASS = 'h-4 w-64';

export const PAGE_SKELETON_VARIANTS: Record<PageSkeletonVariant, SkeletonSpec> = {
  list: {
    containerClassName: PAGE_CONTAINER_CLASS,
    withHeader: true,
    blocks: [
      {
        className: 'h-24 w-full rounded-lg',
        count: 5,
        wrapperClassName: 'space-y-3',
      },
    ],
  },
  grid: {
    containerClassName: PAGE_CONTAINER_CLASS,
    withHeader: true,
    blocks: [
      {
        className: 'h-40 rounded-lg',
        count: 6,
        wrapperClassName:
          'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
      },
    ],
  },
  table: {
    containerClassName: PAGE_CONTAINER_CLASS,
    withHeader: true,
    blocks: [
      { className: 'h-10 w-64', count: 1 },
      {
        className: 'h-16 w-full',
        count: 6,
        wrapperClassName: 'space-y-2',
      },
    ],
  },
  detail: {
    containerClassName: PAGE_CONTAINER_CLASS,
    withHeader: true,
    blocks: [
      { className: 'h-64 w-full rounded-lg', count: 1 },
      {
        className: 'h-32 w-full rounded-lg',
        count: 2,
        wrapperClassName: 'space-y-4',
      },
    ],
  },
  form: {
    containerClassName: PAGE_CONTAINER_CLASS,
    withHeader: true,
    blocks: [
      {
        className: 'h-12 w-full rounded-md',
        count: 6,
        wrapperClassName: 'space-y-4',
      },
      { className: 'h-10 w-32 rounded-md', count: 1 },
    ],
  },
  feed: {
    containerClassName: PAGE_CONTAINER_NARROW_CLASS,
    withHeader: true,
    blocks: [
      { className: 'h-32 rounded-lg', count: 1 },
      {
        className: 'h-48 rounded-lg',
        count: 3,
        wrapperClassName: 'space-y-4',
      },
    ],
  },
};
