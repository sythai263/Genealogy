/**
 * @project AncestorTree
 * @file src/messages/en/contributions.ts
 * @description Contribution / edit suggestions
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Contributions = {
  title: 'Edit suggestions',
  subtitle: 'Submit requests to update person information',
  empty: 'No suggestions yet',
  emptyOwn: 'You have no suggestions yet',
  submit: 'Submit suggestion',
  loginRequired: 'Please sign in to submit edit suggestions',
  loginAction: 'Sign in',
  newSuggestion: 'New suggestion',
  dialogDescription:
    'Submit an update request. An administrator will review and approve it.',
  count: '{count} suggestions',
  itemLabel: 'suggestions',
  reasonPrefix: 'Reason: {reason}',
  reviewNotesPrefix: 'Review notes: {notes}',
  submitting: 'Submitting...',
  statuses: {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  },
  changeTypes: {
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
  },
  changeTypeForm: {
    create: 'Add new person',
    update: 'Update information',
    delete: 'Delete person',
  },
  fields: {
    display_name: 'Full name',
    phone: 'Phone number',
    email: 'Email',
    address: 'Address',
    birth_year: 'Birth year',
    death_year: 'Death year',
    death_lunar: 'Memorial day (lunar)',
    occupation: 'Occupation',
    biography: 'Biography',
    notes: 'Notes',
  },
  form: {
    changeType: 'Change type',
    targetPerson: 'Related person',
    reason: 'Reason for change',
    changes: 'Proposed changes',
    addChange: 'Add field',
    field: 'Field',
    newValue: 'New value',
    fieldPlaceholder: 'Field...',
    valuePlaceholder: 'New value...',
    reasonPlaceholder: 'Explain why this change is needed...',
  },
  toasts: {
    needLogin: 'Please sign in',
    success: 'Suggestion submitted',
    error: 'Failed to submit suggestion',
  },
} as const satisfies AppMessages['Contributions'];
