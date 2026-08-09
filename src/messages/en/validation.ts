/**
 * @project AncestorTree
 * @file src/messages/en/validation.ts
 * @description Zod / form validation messages
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Validation = {
  auth: {
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email',
    passwordRequired: 'Password is required',
    passwordMin8: 'Password must be at least 8 characters',
    passwordMin6: 'Password must be at least 6 characters',
    confirmPasswordRequired: 'Password confirmation is required',
    passwordMismatch: 'Passwords do not match',
    fullNameRequired: 'Full name is required',
    fullNameTooLong: 'Full name is too long',
    otpLength: 'OTP must be 6 digits',
    otpDigitsOnly: 'OTP must contain only digits',
    totpLength: 'Authentication code must be 6 digits',
    totpDigitsOnly: 'Authentication code must contain only digits',
  },
  person: {
    handleRequired: 'Handle is required',
    handleFormat: 'Handle may only contain lowercase letters, numbers, and hyphens',
    displayNameRequired: 'Display name is required',
    displayNameTooLong: 'Name is too long',
    generationMin: 'Generation must be at least 1',
    generationMax: 'Generation maximum is 20',
    lunarDateInvalid: 'Invalid lunar date. Example: 15/7 (day/month)',
    yearMin: 'Year must be {min} or later',
    yearMax: 'Year cannot exceed {max}',
    emailInvalid: 'Invalid email',
    urlInvalid: 'Invalid URL',
    deathYearAfterBirth: 'Death year must be after birth year',
    deathDateAfterBirth: 'Death date must be after birth date',
  },
  profile: {
    displayNameRequired: 'Display name is required',
    displayNameTooLong: 'Display name is too long',
    passwordMin8: 'Password must be at least 8 characters',
    confirmPasswordRequired: 'Password confirmation is required',
    passwordMismatch: 'Passwords do not match',
  },
  contribution: {
    targetPersonRequired: 'Please select a person',
    changesRequired: 'Please add at least one change',
  },
  achievement: {
    personRequired: 'Please select a person',
    titleRequired: 'Title is required',
    titleTooLong: 'Title is too long',
    yearFormat: 'Year must be 4 digits',
  },
  cauDuong: {
    poolNameRequired: 'Please enter a group name',
    ancestorRequired: 'Please select an ancestor',
    minGeneration: 'Minimum generation must be ≥ 1',
    maxAgeMin: 'Maximum lunar age must be ≥ 1',
    maxAgeMax: 'Maximum lunar age must be ≤ 120',
    delegateHostRequired: 'Select who will perform instead',
    rescheduleDateRequired: 'Select the actual date',
    assignPersonRequired: 'Select who will perform',
  },
  common: {
    required: 'This field is required',
    tooLong: 'Content is too long',
    invalid: 'Invalid value',
  },
} as const satisfies AppMessages['Validation'];
