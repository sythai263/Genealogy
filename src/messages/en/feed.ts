/**
 * @project AncestorTree
 * @file src/messages/en/feed.ts
 * @description Community feed
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Feed = {
  title: 'Community feed',
  subtitle: 'Share news, memories, and announcements',
  empty: 'No posts yet',
  emptyFiltered: 'No posts in this category',
  emptyCta: 'Be the first to share!',
  itemLabel: 'posts',
  anonymous: 'Anonymous',
  hidden: 'Hidden',
  showPost: 'Show post',
  hidePost: 'Hide post',
  compose: {
    placeholder: "What's on your mind?",
    post: 'Post',
    posting: 'Posting...',
    addPhotos: 'Add photos',
    photosCount: 'Photos ({count}/{max})',
    uploadError: 'Failed to upload "{name}"',
  },
  types: {
    all: 'All',
    general: 'General',
    photo: 'Photo',
    milestone: 'Good news',
    memory: 'Memory',
    announcement: 'Announcement',
  },
  actions: {
    like: 'Like',
    comment: 'Comment',
    commentCount: '{count} comments',
    delete: 'Delete post',
    pin: 'Pin',
    unpin: 'Unpin',
  },
  comments: {
    placeholder: 'Write a comment...',
    empty: 'No comments yet',
    submit: 'Send',
    delete: 'Delete comment',
  },
  toasts: {
    maxImages: 'Maximum {count} photos',
    contentRequired: 'Please enter post content',
    postSuccess: 'Posted',
    postError: 'Failed to post',
    likeError: 'Failed to like',
    deleteSuccess: 'Post deleted',
    deleteError: 'Failed to delete post',
    commentError: 'Failed to send comment',
    commentDeleteError: 'Failed to delete comment',
    hideSuccess: 'Post hidden',
    showSuccess: 'Post shown',
    genericError: 'Error',
  },
  deleteConfirm: {
    title: 'Delete post?',
    description: 'The post and its comments will be permanently deleted.',
  },
} as const satisfies AppMessages['Feed'];
