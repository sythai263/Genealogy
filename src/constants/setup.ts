/**
 * @project AncestorTree
 * @file src/constants/setup.ts
 * @description Shared constants for desktop first-run setup wizard
 * @version 1.0.0
 * @updated 2026-07-18
 */

export type SetupStep = 'welcome' | 'choice' | 'importing' | 'done';

export const SETUP_STEPS: SetupStep[] = [
  'welcome',
  'choice',
  'importing',
  'done',
];
