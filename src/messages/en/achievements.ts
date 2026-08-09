/**
 * @project AncestorTree
 * @file src/messages/en/achievements.ts
 * @description Achievements / honors
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Achievements = {
  title: 'Honoring descendants',
  subtitle: 'Recognizing outstanding accomplishments of clan members',
  empty: 'No achievements yet',
  add: 'Add achievement',
  edit: 'Edit achievement',
  featured: 'Featured',
  featuredSection: 'Featured achievements',
  listTitle: 'Achievement list ({count})',
  searchPlaceholder: 'Search...',
  itemLabel: 'achievements',
  personMeta: '{name} · Gen. {generation}',
  personMetaChi: '{name} · Gen. {generation} · Branch {chi}',
  categories: {
    all: 'All',
    hoc_tap: 'Study',
    su_nghiep: 'Career',
    cong_hien: 'Contribution',
    other: 'Other',
  },
  form: {
    person: 'Person',
    title: 'Title',
    category: 'Category',
    description: 'Description',
    year: 'Year',
    awardedBy: 'Awarded by',
    isFeatured: 'Featured (show on home)',
    titlePlaceholder: 'Valedictorian, Bach Khoa University',
    awardedByPlaceholder: 'Department of Education',
  },
  toasts: {
    addSuccess: 'Achievement added',
    addError: 'Failed to add achievement',
    updateSuccess: 'Achievement updated',
    updateError: 'Failed to update',
    deleteSuccess: 'Achievement deleted',
    deleteError: 'Failed to delete',
  },
  deleteConfirm: {
    title: 'Delete achievement?',
    description: 'The achievement will be permanently deleted.',
  },
} as const satisfies AppMessages['Achievements'];
