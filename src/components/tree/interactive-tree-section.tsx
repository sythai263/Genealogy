/**
 * @project AncestorTree
 * @file src/components/tree/interactive-tree-section.tsx
 * @description Interactive family tree with legend and zoom guidance
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Skeleton } from '@components/ui';

const FamilyTree = dynamic(
  () =>
    import('./family-tree').then((mod) => ({ default: mod.FamilyTree })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[60vh] w-full rounded-lg" />,
  }
);

export function InteractiveTreeSection() {
  const t = useTranslations('Tree');
  const tCommon = useTranslations('Common');

  return (
    <Card>
      <CardContent className="pt-6">
        <Suspense
          fallback={<Skeleton className="h-[60vh] w-full rounded-lg" />}
        >
          <FamilyTree />
        </Suspense>
        <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">
            {t('guide.title')}
          </p>
          <p>
            • <span className="text-sky-500">{t('guide.maleBorder')}</span> ={' '}
            {tCommon('male')} •{' '}
            <span className="text-rose-500">{t('guide.femaleBorder')}</span> ={' '}
            {tCommon('female')} •{' '}
            <span className="text-rose-400">{t('guide.spouseLine')}</span> ={' '}
            {t('node.spouse')} •{' '}
            <span className="mx-0.5 inline-block h-[3px] w-3 rotate-45 bg-foreground/80 align-middle" />{' '}
            = {tCommon('deceased')}
          </p>
          <p className="mt-1">{t('guide.mobileHint')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
