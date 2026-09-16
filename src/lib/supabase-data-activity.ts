/**
 * @project AncestorTree
 * @file src/lib/supabase-data-activity.ts
 * @description Recent-activity feed for the admin dashboard — merges the latest
 *              contributions, member registrations, and feed posts.
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { ActivityItem } from '@types';
import { supabase } from './supabase';

const ACTIVITY_KIND_LINKS: Record<ActivityItem['kind'], string> = {
  contribution: '/admin/contributions',
  registration: '/admin/registrations',
  post: '/feed',
};

interface ContributionRow {
  id: string;
  change_type: string;
  created_at: string;
  people: { display_name: string } | { display_name: string }[] | null;
}

interface RegistrationRow {
  id: string;
  full_name: string;
  created_at: string;
}

interface PostRow {
  id: string;
  post_type: string;
  created_at: string;
}

function personName(row: ContributionRow): string | null {
  const people = row.people;
  if (!people) return null;
  return Array.isArray(people) ? (people[0]?.display_name ?? null) : people.display_name;
}

export async function getRecentActivity(
  perSource: number = 5
): Promise<ActivityItem[]> {
  const [contributions, registrations, posts] = await Promise.all([
    supabase
      .from('contributions')
      .select('id, change_type, created_at, people!target_person(display_name)')
      .order('created_at', { ascending: false })
      .limit(perSource),
    supabase
      .from('member_registrations')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(perSource),
    supabase
      .from('posts')
      .select('id, post_type, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(perSource),
  ]);

  if (contributions.error) throw contributions.error;
  if (registrations.error) throw registrations.error;
  if (posts.error) throw posts.error;

  const items: ActivityItem[] = [
    ...((contributions.data ?? []) as ContributionRow[]).map((row) => ({
      id: `contribution-${row.id}`,
      kind: 'contribution' as const,
      name: personName(row),
      detail: row.change_type,
      link: ACTIVITY_KIND_LINKS.contribution,
      created_at: row.created_at,
    })),
    ...((registrations.data ?? []) as RegistrationRow[]).map((row) => ({
      id: `registration-${row.id}`,
      kind: 'registration' as const,
      name: row.full_name,
      detail: 'member_registration',
      link: ACTIVITY_KIND_LINKS.registration,
      created_at: row.created_at,
    })),
    ...((posts.data ?? []) as PostRow[]).map((row) => ({
      id: `post-${row.id}`,
      kind: 'post' as const,
      name: null,
      detail: row.post_type,
      link: ACTIVITY_KIND_LINKS.post,
      created_at: row.created_at,
    })),
  ];

  return items
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, perSource * 2);
}
