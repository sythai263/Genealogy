/**
 * @project AncestorTree
 * @file src/components/documents/book-person-entry.tsx
 * @description Single person entry in the printable family book
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { Heart, User, Users } from 'lucide-react';
import { cn } from '@lib';
import type { BookPerson } from '@types';

interface BookPersonEntryProps {
  entry: BookPerson;
}

export function BookPersonEntry({ entry }: BookPersonEntryProps) {
  const t = useTranslations('Documents');
  const { person, father, mother, spouses, children, zodiacYear } = entry;

  return (
    <div className="book-person py-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
            person.gender === 1
              ? 'bg-blue-100 text-blue-800'
              : 'bg-pink-100 text-pink-800'
          )}
        >
          {person.gender === 1 ? '♂' : '♀'}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-semibold">
            {person.display_name}
            {!person.is_living && ' †'}
          </h4>

          <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            {(person.birth_year || person.death_year) && (
              <p>
                {person.birth_year &&
                  t('book.birth', { year: person.birth_year })}
                {zodiacYear && ` (${zodiacYear})`}
                {person.death_year &&
                  ` — ${t('book.death', { year: person.death_year })}`}
                {person.death_lunar &&
                  ` (${t('book.lunar', { date: person.death_lunar })})`}
              </p>
            )}

            {person.birth_place && (
              <p>{t('book.birthPlace', { place: person.birth_place })}</p>
            )}
            {person.hometown && (
              <p>{t('book.hometown', { place: person.hometown })}</p>
            )}
            {person.occupation && (
              <p>{t('book.occupation', { job: person.occupation })}</p>
            )}

            {(father || mother) && (
              <p className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {t('book.parents', {
                  father: father?.display_name || '?',
                  mother: mother?.display_name || '?',
                })}
              </p>
            )}

            {spouses.length > 0 && (
              <p className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {person.gender === 1 ? t('book.wife') : t('book.husband')}:{' '}
                {spouses.map((spouse) => spouse.display_name).join(', ')}
              </p>
            )}

            {children.length > 0 && (
              <p className="flex items-start gap-1">
                <User className="mt-0.5 h-3 w-3" />
                <span>
                  {t('book.children', { count: children.length })}:{' '}
                  {children.map((child) => child.display_name).join(', ')}
                </span>
              </p>
            )}

            {person.biography && (
              <p className="mt-1 line-clamp-3 italic">{person.biography}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
