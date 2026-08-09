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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@components/ui';

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
      <CardHeader>
        <CardTitle className="text-base">{t('guide.title')}</CardTitle>
        <CardDescription className="space-y-1">
          <span className="block sm:inline">
            • <span className="text-blue-500">{t('guide.maleBorder')}</span> ={' '}
            {tCommon('male')} •{' '}
            <span className="text-pink-500">{t('guide.femaleBorder')}</span> ={' '}
            {tCommon('female')}
          </span>
          <span className="block sm:inline">
            • <span className="text-pink-400">{t('guide.spouseLine')}</span> ={' '}
            {t('node.spouse')} • † = {tCommon('deceased')}
          </span>
          <span className="mt-1 block text-xs">{t('guide.mobileHint')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={<Skeleton className="h-[60vh] w-full rounded-lg" />}
        >
          <FamilyTree />
        </Suspense>
      </CardContent>
    </Card>
  );
}
