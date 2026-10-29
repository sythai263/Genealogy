/**
 * @project AncestorTree
 * @file src/components/settings/clan-info-card.tsx
 * @description Clan info form card — names, founding year, patriarch, origin,
 *              description, contact + sidebar preview + save
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { type FormEvent } from 'react';
import { Globe, Loader2, Save } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Textarea,
} from '@components/ui';

export interface ClanInfoValues {
  clanName: string;
  clanFullName: string;
  foundingYear: string;
  origin: string;
  patriarch: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}

interface ClanInfoCardProps {
  values: ClanInfoValues;
  onFieldChange: (field: keyof ClanInfoValues, value: string) => void;
  previewInitial: string;
  previewSubtitle: string;
  fallbackClanName: string;
  isLoading: boolean;
  isSaving: boolean;
  canSubmit: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function ClanInfoCard({
  values,
  onFieldChange,
  previewInitial,
  previewSubtitle,
  fallbackClanName,
  isLoading,
  isSaving,
  canSubmit,
  onSubmit,
}: ClanInfoCardProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {t('settings.clanInfo.title')}
        </CardTitle>
        <CardDescription>{t('settings.clanInfo.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('settings.fields.shortName')}</Label>
                <Input
                  value={values.clanName}
                  onChange={(e) => onFieldChange('clanName', e.target.value)}
                  placeholder={t('settings.placeholders.shortName')}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('settings.fields.shortNameHint')}
                </p>
              </div>
              <div>
                <Label>{t('settings.fields.foundingYear')}</Label>
                <Input
                  type="number"
                  value={values.foundingYear}
                  onChange={(e) =>
                    onFieldChange('foundingYear', e.target.value)
                  }
                  placeholder="1750"
                  min={1000}
                  max={2100}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>{t('settings.fields.fullName')}</Label>
              <Input
                value={values.clanFullName}
                onChange={(e) => onFieldChange('clanFullName', e.target.value)}
                placeholder={t('settings.placeholders.fullName')}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('settings.fields.fullNameHint')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('settings.fields.patriarch')}</Label>
                <Input
                  value={values.patriarch}
                  onChange={(e) => onFieldChange('patriarch', e.target.value)}
                  placeholder={t('settings.placeholders.ancestor')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('settings.fields.origin')}</Label>
                <Input
                  value={values.origin}
                  onChange={(e) => onFieldChange('origin', e.target.value)}
                  placeholder={t('settings.placeholders.hometown')}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>{t('settings.fields.history')}</Label>
              <Textarea
                value={values.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                rows={4}
                placeholder={t('settings.placeholders.intro')}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('settings.fields.contactEmail')}</Label>
                <Input
                  type="email"
                  value={values.contactEmail}
                  onChange={(e) =>
                    onFieldChange('contactEmail', e.target.value)
                  }
                  placeholder="hoidong@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('settings.fields.contactPhone')}</Label>
                <Input
                  value={values.contactPhone}
                  onChange={(e) =>
                    onFieldChange('contactPhone', e.target.value)
                  }
                  placeholder="0912 345 678"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('settings.preview.sidebar')}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shrink-0">
                  {previewInitial}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {values.clanName || fallbackClanName}
                  </p>
                  {previewSubtitle && (
                    <p className="text-xs text-muted-foreground">
                      {previewSubtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isSaving || !canSubmit}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tCommon('saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('settings.saveChanges')}
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
