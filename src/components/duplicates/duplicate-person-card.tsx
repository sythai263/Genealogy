/**
 * @project AncestorTree
 * @file src/components/duplicates/duplicate-person-card.tsx
 * @description Person summary card for duplicate pair review
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { Button } from '@components/ui';
import type { DuplicatePair } from '@types';

interface DuplicatePersonCardProps {
  person: DuplicatePair['personA'];
}

export function DuplicatePersonCard({ person }: DuplicatePersonCardProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');

  return (
    <div className='flex-1 min-w-0 space-y-1'>
      <p className='font-medium text-sm truncate'>{person.display_name}</p>
      <div className='flex flex-wrap gap-1 text-xs text-muted-foreground'>
        <span>{t('duplicates.generationLine', { generation: person.generation })}</span>
        {person.birth_year && (
          <span>· {t('duplicates.bornYear', { year: person.birth_year })}</span>
        )}
        {person.gender === 1 ? (
          <span>· {tCommon('male')}</span>
        ) : (
          <span>· {tCommon('female')}</span>
        )}
      </div>
      <Button variant='ghost' size='sm' className='h-7 text-xs px-2' asChild>
        <Link href={`/people/${person.id}`}>
          <ExternalLink className='h-3 w-3 mr-1' />
          {t('duplicates.viewDetails')}
        </Link>
      </Button>
    </div>
  );
}
