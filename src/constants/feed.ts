/**
 * @project AncestorTree
 * @file src/constants/feed.ts
 * @description Shared constants for community feed (labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { PostType } from '@types';

export const FEED_MAX_IMAGES = 5;
export const FEED_MAX_CONTENT_LENGTH = 5000;

export const POST_TYPE_ORDER: PostType[] = [
  'general',
  'photo',
  'milestone',
  'memory',
  'announcement',
];

export type FeedFilterKey = PostType | 'all';

export const FEED_FILTER_KEYS: FeedFilterKey[] = ['all', ...POST_TYPE_ORDER];

export function isPostType(value: string): value is PostType {
  for (const postType of POST_TYPE_ORDER) {
    if (postType === value) return true;
  }
  return false;
}

export function isFeedFilterKey(value: string): value is FeedFilterKey {
  return value === 'all' || isPostType(value);
}
