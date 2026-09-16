/**
 * @project AncestorTree
 * @file src/types/activity.ts
 * @description Recent-activity feed item for the admin dashboard
 * @version 1.0.0
 * @updated 2026-08-09
 */

export type ActivityKind = 'contribution' | 'registration' | 'post';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  /** Display name of the related person/member when available */
  name: string | null;
  /** Extra context — e.g. contribution change_type or post_type */
  detail: string;
  link: string;
  created_at: string;
}
