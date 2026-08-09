/**
 * @project AncestorTree
 * @file src/components/users/person-name.tsx
 * @description Inline loader that shows a person's display name by ID
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { usePerson } from '@hooks';

interface PersonNameProps {
  personId?: string;
}

export function PersonName({ personId }: PersonNameProps) {
  const { data: person, isLoading } = usePerson(personId);
  if (!personId)
    return <span className='text-muted-foreground text-xs'>—</span>;
  if (isLoading)
    return <span className='text-xs text-muted-foreground'>...</span>;
  if (!person) return <span className='text-xs text-muted-foreground'>—</span>;
  return (
    <span className='text-xs font-medium truncate max-w-30 block'>
      {person.display_name}
    </span>
  );
}
