/**
 * @project AncestorTree
 * @file src/components/settings/system-info-card.tsx
 * @description Read-only system info card — app version, database, last
 *              settings update
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Database } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { APP_VERSION_DISPLAY } from '@constants';

interface SystemInfoCardProps {
  updatedAt?: string;
}

export function SystemInfoCard({ updatedAt }: SystemInfoCardProps) {
  const t = useTranslations('Admin');
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4" />
          {t('settings.system.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">
              {t('settings.system.version')}
            </span>
            <Badge variant="outline">{APP_VERSION_DISPLAY}</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">
              {t('settings.system.database')}
            </span>
            <Badge variant="outline">
              {t('settings.system.databaseValue')}
            </Badge>
          </div>
          {updatedAt && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                {t('settings.system.lastUpdated')}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(updatedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
