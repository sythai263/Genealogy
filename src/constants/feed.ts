/**
 * @project AncestorTree
 * @file src/constants/feed.ts
 * @description Shared constants for community feed
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { PostType } from '@types';

export const POST_TYPE_LABELS: Record<PostType, string> = {
  general: 'Chung',
  photo: 'Ảnh',
  milestone: 'Tin vui',
  memory: 'Kỷ niệm',
  announcement: 'Thông báo',
};

export const POST_TYPE_ORDER: PostType[] = [
  'general',
  'photo',
  'milestone',
  'memory',
  'announcement',
];

export type FeedFilterKey = PostType | 'all';

export const FEED_FILTER_TABS: { key: FeedFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  ...POST_TYPE_ORDER.map((key) => ({
    key,
    label: POST_TYPE_LABELS[key],
  })),
];

export function isPostType(value: string): value is PostType {
  for (const postType of POST_TYPE_ORDER) {
    if (postType === value) return true;
  }
  return false;
}

export function isFeedFilterKey(value: string): value is FeedFilterKey {
  return value === 'all' || isPostType(value);
}
