/**
 * @project AncestorTree
 * @file src/components/relationship/relationship-view.tsx
 * @description Relationship finder — select two people and show connection
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Route } from 'lucide-react';
import { PersonCombobox } from '@components/people';
import { LoadingState, PageHeader } from '@components/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { useRelationship } from '@hooks';
import type { Person } from '@types';
import { RelationshipResultCard } from './relationship-result-card';

export function RelationshipView() {
  const t = useTranslations('Relationship');
  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const { result, isLoading } = useRelationship(
    personA?.id ?? null,
    personB?.id ?? null
  );

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div>
        <PageHeader icon={Route} title={t('title')} />
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('selectTitle')}</CardTitle>
          <CardDescription>{t('selectHint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <PersonCombobox
              label={t('personA')}
              selected={personA}
              onSelect={setPersonA}
              excludeId={personB?.id}
            />
            <PersonCombobox
              label={t('personB')}
              selected={personB}
              onSelect={setPersonB}
              excludeId={personA?.id}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && personA && personB && <LoadingState variant="detail" />}

      {result && !isLoading && personA && (
        <RelationshipResultCard result={result} treeRootId={personA.id} />
      )}
    </div>
  );
}
