/**
 * @project AncestorTree
 * @file src/components/people/own-family-section.tsx
 * @description One nuclear-family block (spouse + children) inside the
 *              family relations card
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button, Separator } from '@components/ui';
import type { Person, PersonRelations } from '@types';
import { PersonLink } from './person-link';

interface OwnFamilySectionProps {
  familyEntry: PersonRelations['ownFamilies'][0];
  currentPerson: Person;
  canEdit: boolean;
  index: number;
  onAddChild: () => void;
  onAddSpouse: (familyId: string) => void;
}

export function OwnFamilySection({
  familyEntry,
  currentPerson,
  canEdit,
  index,
  onAddChild,
  onAddSpouse,
}: OwnFamilySectionProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const { family, spouse, children } = familyEntry;
  const spouseLabel =
    currentPerson.gender === 1 ? t('relations.wife') : t('relations.husband');

  return (
    <div className="space-y-3">
      {index > 0 && <Separator />}

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {spouseLabel}
            {family.marriage_date && (
              <span className="ml-2 font-normal normal-case">
                {t('relations.marriedOn', { date: family.marriage_date })}
              </span>
            )}
          </p>
          {canEdit && !spouse && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onAddSpouse(family.id)}
            >
              <Plus className="mr-1 h-3 w-3" />
              {t('relations.addRole', { role: spouseLabel.toLowerCase() })}
            </Button>
          )}
        </div>
        {spouse ? (
          <PersonLink person={spouse} />
        ) : (
          <p className="px-2 text-sm text-muted-foreground">
            {tCommon('unknown')}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {t('relations.childrenCount', { count: children.length })}
          </p>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onAddChild}
            >
              <Plus className="mr-1 h-3 w-3" />
              {t('relations.addChild')}
            </Button>
          )}
        </div>
        {children.length > 0 ? (
          <div className="space-y-0.5">
            {children.map((child) => (
              <PersonLink key={child.id} person={child} />
            ))}
          </div>
        ) : (
          <p className="px-2 text-sm text-muted-foreground">
            {t('relations.noChildren')}
          </p>
        )}
      </div>
    </div>
  );
}
