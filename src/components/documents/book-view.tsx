/**
 * @project AncestorTree
 * @file src/components/documents/book-view.tsx
 * @description Printable family chronicle book view
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Printer } from 'lucide-react';
import { ErrorState, PageSkeleton } from '@components/shared';
import { Button, Separator } from '@components/ui';
import { useClanSettings, useTreeData } from '@hooks';
import { CLAN_FULL_NAME, generateBookData } from '@lib';
import { BookChapterSection } from './book-chapter-section';

export function BookView() {
  const t = useTranslations('Documents');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { data: treeData, isLoading, error } = useTreeData();
  const { data: clanSettings } = useClanSettings();
  const clanFullName = clanSettings?.clan_full_name ?? CLAN_FULL_NAME;

  if (isLoading) {
    return <PageSkeleton variant="detail" className="max-w-3xl" />;
  }

  if (error || !treeData) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <ErrorState
          error={error}
          title={tCommon('routeErrors.documentsBook')}
          description={t('book.emptyDescription')}
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tCommon('back')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const chapters = generateBookData(treeData);
  const totalPeople = chapters.reduce(
    (sum, chapter) =>
      sum +
      chapter.branches.reduce(
        (branchSum, branch) => branchSum + branch.people.length,
        0
      ),
    0
  );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="no-print mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('title')}
          </Link>
        </Button>
        <Button onClick={() => window.print()} size="sm">
          <Printer className="mr-2 h-4 w-4" />
          {t('book.printSave')}
        </Button>
      </div>

      <div className="book-content space-y-8">
        <div className="book-cover border-b-2 border-emerald-600 py-12 text-center">
          <h1 className="mb-2 text-3xl font-bold text-emerald-900 md:text-4xl">
            {t('book.coverTitle')}
          </h1>
          <h2 className="mb-4 text-xl font-semibold text-emerald-700 md:text-2xl">
            {clanFullName}
          </h2>
          <p className="mb-6 text-muted-foreground italic">
            &ldquo;{t('book.motto')}&rdquo;
          </p>
          <Separator className="mx-auto max-w-xs" />
          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p>
              {t('book.summary', {
                people: totalPeople,
                generations: chapters.length,
              })}
            </p>
            <p>
              {t('book.published', {
                date: new Date().toLocaleDateString(locale),
              })}
            </p>
          </div>
        </div>

        <div className="book-toc">
          <h2 className="mb-3 text-lg font-bold">{t('book.toc')}</h2>
          <div className="space-y-1">
            {chapters.map((chapter) => {
              const count = chapter.branches.reduce(
                (sum, branch) => sum + branch.people.length,
                0
              );
              return (
                <div
                  key={chapter.generation}
                  className="flex justify-between border-b border-dotted pb-1 text-sm"
                >
                  <span>{chapter.title}</span>
                  <span className="text-muted-foreground">
                    {t('book.peopleCount', { count })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {chapters.map((chapter) => (
          <BookChapterSection key={chapter.generation} chapter={chapter} />
        ))}

        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>{t('book.footer', { clan: clanFullName })}</p>
          <p>
            {t('book.createdBy', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </div>
  );
}
