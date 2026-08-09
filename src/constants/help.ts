/**
 * @project AncestorTree
 * @file src/constants/help.ts
 * @description Structural keys for in-app help (content via next-intl Help.*)
 * @version 1.1.0
 * @updated 2026-08-09
 */

export const HELP_NAV_ITEM_KEYS = [
  'home',
  'tree',
  'people',
  'directory',
  'events',
  'contributions',
  'achievements',
  'fund',
  'charter',
  'cauDuong',
  'documents',
] as const;

export type HelpNavItemKey = (typeof HELP_NAV_ITEM_KEYS)[number];

export const HELP_WORKFLOW_KEYS = [
  'addPerson',
  'viewTree',
  'events',
] as const;

export type HelpWorkflowKey = (typeof HELP_WORKFLOW_KEYS)[number];

export const HELP_ROLE_KEYS = [
  'admin',
  'editor',
  'viewer',
  'guest',
] as const;

export type HelpRoleKey = (typeof HELP_ROLE_KEYS)[number];

export const HELP_FAQ_KEYS = [
  'dataLoss',
  'backup',
  'capacity',
  'relations',
  'cauDuong',
] as const;

export type HelpFaqKey = (typeof HELP_FAQ_KEYS)[number];

/** Tip items are indexed arrays in Help.tips.items */
export const HELP_TIP_COUNT = 6;
