/**
 * @project AncestorTree
 * @file src/components/people/person-link.tsx
 * @description Compact person chip linking to the person detail page
 * @version 1.0.0
 * @updated 2026-10-29
 */

import Link from 'next/link';
import type { Person } from '@types';
import { PersonGenderAvatar } from './person-gender-avatar';

interface PersonLinkProps {
  person: Person;
}

export function PersonLink({ person }: PersonLinkProps) {
  return (
    <Link
      href={`/people/${person.id}`}
      className="group flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
    >
      <PersonGenderAvatar
        gender={person.gender}
        name={person.display_name}
      />
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
