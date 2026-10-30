/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-selected-card.tsx
 * @description Floating card for the currently selected tree person
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
} from '@components/ui';
import { cn, getInitials, getPersonTreeNameParts } from '@lib';
import type { Person } from '@types';

interface FamilyTreeSelectedCardProps {
  person: Person;
  onClose: () => void;
  /** When false (public landing), hide the detail link and living-person years. */
  showDetailLink?: boolean;
  className?: string;
}

export function FamilyTreeSelectedCard({
  person,
  onClose,
  showDetailLink = true,
  className,
}: FamilyTreeSelectedCardProps) {
  const t = useTranslations('Tree');
  const tCommon = useTranslations('Common');
  const { givenName, familyLine } = getPersonTreeNameParts(person);
  const showYears = !person.is_living || showDetailLink;
  const yearsLine = showYears
    ? [person.birth_year, person.death_year].filter(Boolean).join(' – ')
    : '';

  return (
    <Card
      className={cn(
        'animate-in fade-in slide-in-from-bottom-8 fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 shadow-2xl sm:bottom-6 sm:w-[90%]',
        className
      )}
    >
      <CardContent className="flex items-center justify-between gap-2 rounded-xl bg-background p-3 sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/10 sm:h-12 sm:w-12">
            <AvatarImage src={person.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-base font-semibold text-muted-foreground sm:text-lg">
              {getInitials(givenName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">
              {givenName}
              {yearsLine ? (
                <span className="font-normal text-muted-foreground">
                  {' '}
                  ({yearsLine})
                </span>
              ) : null}
            </h3>
            {familyLine ? (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {familyLine}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              <span>
                {t('selected.chi', {
                  chi: person.chi != null ? person.chi : '',
                })}
              </span>
              <span className="ml-1">
                {t('selected.generation', { n: person.generation })}
              </span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {showDetailLink ? (
            <Button asChild size="sm" className="rounded-full px-4 sm:px-6">
              <Link href={`/people/${person.id}`}>{tCommon('details')}</Link>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground"
            aria-label={tCommon('close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
