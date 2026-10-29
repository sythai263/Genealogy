/**
 * @project AncestorTree
 * @file src/components/people/person-link.tsx
 * @description Compact person chip linking to the person detail page
 * @version 1.0.0
 * @updated 2026-10-29
 */

import Link from 'next/link';
import type { Person } from '@types';

interface PersonLinkProps {
  person: Person;
}

export function PersonLink({ person }: PersonLinkProps) {
  return (
    <Link
      href={`/people/${person.id}`}
      className="group flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
          person.gender === 1
            ? 'bg-blue-100 text-blue-700'
            : 'bg-pink-100 text-pink-700'
        }`}
      >
        {person.display_name.slice(-1)}
      </div>
      <span className="text-sm transition-colors group-hover:text-primary">
        {person.display_name}
      </span>
      {person.birth_year && (
        <span className="text-xs text-muted-foreground">
          ({person.birth_year})
        </span>
      )}
      {!person.is_living && (
        <span className="text-xs text-muted-foreground">†</span>
      )}
    </Link>
  );
}
