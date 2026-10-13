/**
 * @project AncestorTree
 * @file src/components/home/clan-overview.tsx
 * @description Public home clan introduction — description, history, mission,
 *              general info and council contact from clan settings.
 * @version 1.0.0
 * @updated 2026-10-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { BookOpen, Info, Mail, Phone, Target } from 'lucide-react';
import { useClanSettings } from '@hooks';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@components/ui';

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between gap-4 border-b py-1.5 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export function ClanOverview() {
  const t = useTranslations('Landing');
  const { data: cs, isLoading } = useClanSettings();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-24" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const hasGeneralInfo = Boolean(
    cs?.clan_patriarch || cs?.clan_founding_year || cs?.clan_origin
  );
  const hasContact = Boolean(cs?.contact_email || cs?.contact_phone);
  const hasContent =
    Boolean(cs?.clan_description || cs?.clan_history || cs?.clan_mission) ||
    hasGeneralInfo ||
    hasContact;

  if (!cs || !hasContent) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>{t('about.empty')}</p>
          <p className="mt-1 text-sm">{t('about.emptyHint')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {cs.clan_description && (
        <p className="text-center text-lg leading-relaxed whitespace-pre-line text-muted-foreground">
          {cs.clan_description}
        </p>
      )}

      {cs.clan_history && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {t('about.historyTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
              {cs.clan_history}
            </p>
          </CardContent>
        </Card>
      )}

      {cs.clan_mission && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {t('about.missionTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
              {cs.clan_mission}
            </p>
          </CardContent>
        </Card>
      )}

      {(hasGeneralInfo || hasContact) && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {hasGeneralInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  {t('about.generalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cs.clan_patriarch && (
                  <InfoRow label={t('about.patriarch')} value={cs.clan_patriarch} />
                )}
                {cs.clan_founding_year && (
                  <InfoRow
                    label={t('about.foundingYear')}
                    value={cs.clan_founding_year}
                  />
                )}
                {cs.clan_origin && (
                  <InfoRow label={t('about.origin')} value={cs.clan_origin} />
                )}
              </CardContent>
            </Card>
          )}

          {hasContact && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  {t('about.contactTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cs.contact_email && (
                  <a
                    href={`mailto:${cs.contact_email}`}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {cs.contact_email}
                  </a>
                )}
                {cs.contact_phone && (
                  <a
                    href={`tel:${cs.contact_phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {cs.contact_phone}
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
