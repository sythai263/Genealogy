/**
 * @project AncestorTree
 * @file src/messages/en/directory.ts
 * @description Family directory / contact book
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Directory = {
  title: 'Contact directory',
  subtitle: 'Contact information for clan members',
  empty: 'No contact information yet',
  noResults: 'No matching people',
  searchPlaceholder: 'Search by name...',
  filterTitle: 'Filters',
  allGenerations: 'All generations',
  generationValue: 'Gen. {generation}',
  memberCount: '{count} people',
  loginPrompt: 'Sign in for full details',
  maskedShort: 'Hidden',
  loadError: 'Failed to load data: {message}',
  filters: {
    gender: 'Gender',
    status: 'Status',
    all: 'All',
    male: 'Male',
    female: 'Female',
    living: 'Living',
    deceased: 'Deceased',
  },
  fields: {
    phone: 'Phone',
    email: 'Email',
    zalo: 'Zalo',
    facebook: 'Facebook',
    address: 'Address',
    generation: 'Generation',
    name: 'Full name',
    links: 'Links',
  },
  masked: 'Sign in to view contact information',
  copySuccess: 'Copied',
} as const satisfies AppMessages['Directory'];
