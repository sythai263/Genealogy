/**
 * @project AncestorTree
 * @file src/components/duplicates/duplicate-person-card.tsx
 * @description Person summary card for duplicate pair review
 * @version 1.0.0
 * @updated 2026-08-09
 */

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@components/ui';
import type { DuplicatePair } from '@types';

interface DuplicatePersonCardProps {
  person: DuplicatePair['personA'];
}

export function DuplicatePersonCard({ person }: DuplicatePersonCardProps) {
  return (
    <div className='flex-1 min-w-0 space-y-1'>
      <p className='font-medium text-sm truncate'>{person.display_name}</p>
      <div className='flex flex-wrap gap-1 text-xs text-muted-foreground'>
        <span>Đời {person.generation}</span>
        {person.birth_year && <span>· Sinh {person.birth_year}</span>}
        {person.gender === 1 ? <span>· Nam</span> : <span>· Nữ</span>}
      </div>
      <Button variant='ghost' size='sm' className='h-7 text-xs px-2' asChild>
        <Link href={`/people/${person.id}`}>
          <ExternalLink className='h-3 w-3 mr-1' />
          Xem chi tiết
        </Link>
      </Button>
    </div>
  );
}
