/**
 * @project AncestorTree
 * @file src/app/(landing)/council/council-content.tsx
 * @description Client component for council page — fetches clan settings
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { useClanSettings } from '@hooks';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@components/ui';
import { CLAN_FULL_NAME } from '@lib';
import { Users, BookOpen, Target } from 'lucide-react';
import Link from 'next/link';
import type { CouncilMember } from '@types';

export function CouncilContent() {
  const t = useTranslations('Landing');
  const { data: cs, isLoading } = useClanSettings();

  const councilMembers = (cs?.council_members ?? []) as CouncilMember[];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <Skeleton className="mx-auto h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {t('pages.council.title')}
        </h1>
        <p className="text-lg text-gray-600">
          {cs?.clan_full_name ?? CLAN_FULL_NAME}
        </p>
      </div>

      {councilMembers.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5" />
            {t('pages.council.membersTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {councilMembers.map((m, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {m.name?.charAt(m.name.lastIndexOf(' ') + 1) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {cs?.clan_history && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <BookOpen className="h-5 w-5" />
            {t('pages.council.historyTitle')}
          </h2>
          <Card>
            <CardContent className="prose prose-gray max-w-none py-6">
              <p className="whitespace-pre-line">{cs.clan_history}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {cs?.clan_mission && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Target className="h-5 w-5" />
            {t('pages.council.missionTitle')}
          </h2>
          <Card>
            <CardContent className="prose prose-gray max-w-none py-6">
              <p className="whitespace-pre-line">{cs.clan_mission}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {(cs?.clan_patriarch || cs?.clan_origin || cs?.clan_founding_year) && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('pages.council.generalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cs.clan_patriarch && (
                <div className="flex justify-between border-b py-1.5">
                  <span className="text-sm text-gray-500">
                    {t('pages.council.patriarch')}
                  </span>
                  <span className="text-sm font-medium">{cs.clan_patriarch}</span>
                </div>
              )}
              {cs.clan_founding_year && (
                <div className="flex justify-between border-b py-1.5">
                  <span className="text-sm text-gray-500">
                    {t('pages.council.foundingYear')}
                  </span>
                  <span className="text-sm font-medium">
                    {cs.clan_founding_year}
                  </span>
                </div>
              )}
              {cs.clan_origin && (
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-500">
                    {t('pages.council.origin')}
                  </span>
                  <span className="text-sm font-medium">{cs.clan_origin}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {councilMembers.length === 0 && !cs?.clan_history && !cs?.clan_mission && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>{t('pages.council.empty')}</p>
            <p className="mt-1 text-sm">{t('pages.council.emptyHint')}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <Link href="/" className="text-sm text-primary hover:underline">
          {t('pageNav.home')}
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/family-tree" className="text-sm text-primary hover:underline">
          {t('pageNav.tree')}
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href="/ancestral-hall"
          className="text-sm text-primary hover:underline"
        >
          {t('pageNav.hall')}
        </Link>
        <span className="text-gray-300">|</span>
        <Link
          href="/register-member"
          className="text-sm text-primary hover:underline"
        >
          {t('pageNav.register')}
        </Link>
      </div>
    </div>
  );
}
