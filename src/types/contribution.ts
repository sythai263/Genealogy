import type { JsonObject } from './json';

export type ContributionStatus = 'pending' | 'approved' | 'rejected';
export type ChangeType = 'create' | 'update' | 'delete';

export interface Contribution {
  id: string;
  author_id: string;
  target_person: string;
  change_type: ChangeType;
  changes: JsonObject;
  reason?: string;
  status: ContributionStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

export interface ContributionsListFilters {
  status?: ContributionStatus;
  /** Scope to a single author's proposals (member view). */
  authorId?: string;
  page: number;
  pageSize: 20 | 30 | 50;
}
