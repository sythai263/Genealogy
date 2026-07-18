/**
 * @project AncestorTree
 * @file src/components/directory/get-contact-display.ts
 * @description Privacy-aware contact field resolution for directory
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { DirectoryContactDisplay, Person } from '@types';

const MASKED_CONTACT: DirectoryContactDisplay = {
  phone: null,
  email: null,
  address: null,
  zalo: null,
  facebook: null,
  masked: true,
};

interface GetContactDisplayParams {
  person: Person;
  isAuthenticated: boolean;
  isViewer: boolean;
  linkedPersonId?: string;
}

export function getContactDisplay({
  person,
  isAuthenticated,
  isViewer,
  linkedPersonId,
}: GetContactDisplayParams): DirectoryContactDisplay {
  // Viewer role: only see names, all contacts masked (except self)
  if (isViewer && person.id !== linkedPersonId) {
    return MASKED_CONTACT;
  }
  // Privacy level 2 = private: hide contacts from everyone except the person themselves
  if (person.privacy_level === 2 && person.id !== linkedPersonId) {
    return MASKED_CONTACT;
  }
  // Privacy level 1 = members only: hide contacts from non-authenticated users
  if (person.privacy_level === 1 && !isAuthenticated) {
    return MASKED_CONTACT;
  }
  return {
    phone: person.phone || null,
    email: person.email || null,
    address: person.address || person.hometown || null,
    zalo: person.zalo || null,
    facebook: person.facebook || null,
    masked: false,
  };
}

export function canSearchPersonContacts(
  person: Person,
  isAuthenticated: boolean,
  isViewer: boolean,
  linkedPersonId?: string
): boolean {
  const isSelf = person.id === linkedPersonId;
  if (isSelf) return true;
  if (isViewer) return false;
  if (!isAuthenticated) return false;
  if (person.privacy_level === 2) return false;
  if (person.privacy_level === 1 && !isAuthenticated) return false;
  return true;
}
