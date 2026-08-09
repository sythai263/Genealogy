/**
 * @project AncestorTree
 * @file src/messages/en/charter.ts
 * @description Clan charter
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Charter = {
  title: 'Clan charter',
  subtitle: 'Family teachings, rules, and ancestral advice',
  empty: 'No articles yet',
  add: 'Add article',
  edit: 'Edit article',
  featured: 'Featured',
  featuredTitle: 'Clan charter',
  featuredSubtitle: 'Traditional teachings and rules',
  viewAll: 'View all',
  categories: {
    gia_huan: 'Family teachings',
    quy_uoc: 'Rules',
    loi_dan: 'Advice to descendants',
  },
  form: {
    title: 'Title',
    category: 'Category',
    content: 'Content',
    isFeatured: 'Featured',
    version: 'Version',
    sortOrder: 'Sort order',
    titlePlaceholder: 'On filial piety',
    contentPlaceholder: 'Article content...',
  },
  toasts: {
    fieldsRequired: 'Please enter title and content',
    addSuccess: 'Article added',
    addError: 'Failed to add article',
    updateSuccess: 'Article updated',
    updateError: 'Failed to update',
    deleteSuccess: 'Article deleted',
    deleteError: 'Failed to delete',
  },
  deleteConfirm: {
    title: 'Delete article?',
    description: 'The article will be permanently deleted.',
  },
} as const satisfies AppMessages['Charter'];
