/**
 * @project AncestorTree
 * @file src/components/settings/history-mission-card.tsx
 * @description Clan history & mission text editor card
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from '@components/ui';

interface HistoryMissionCardProps {
  history: string;
  mission: string;
  onHistoryChange: (value: string) => void;
  onMissionChange: (value: string) => void;
}

export function HistoryMissionCard({
  history,
  mission,
  onHistoryChange,
  onMissionChange,
}: HistoryMissionCardProps) {
  const t = useTranslations('Admin');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {t('settings.historyMission.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.historyMission.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{t('settings.historyMission.history')}</Label>
          <Textarea
            value={history}
            onChange={(e) => onHistoryChange(e.target.value)}
            rows={4}
            placeholder={t('settings.placeholders.origin')}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{t('settings.historyMission.mission')}</Label>
          <Textarea
            value={mission}
            onChange={(e) => onMissionChange(e.target.value)}
            rows={3}
            placeholder={t('settings.placeholders.mission')}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
