/**
 * @project AncestorTree
 * @file src/components/settings/ancestral-hall-card.tsx
 * @description Ancestral hall card — address, history, and ceremony schedule
 *              editor rows
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Landmark, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@components/ui';
import type { CeremonyScheduleItem } from '@types';

interface AncestralHallCardProps {
  address: string;
  history: string;
  ceremonies: CeremonyScheduleItem[];
  onAddressChange: (value: string) => void;
  onHistoryChange: (value: string) => void;
  onCeremoniesChange: (items: CeremonyScheduleItem[]) => void;
}

export function AncestralHallCard({
  address,
  history,
  ceremonies,
  onAddressChange,
  onHistoryChange,
  onCeremoniesChange,
}: AncestralHallCardProps) {
  const t = useTranslations('Admin');

  const updateCeremony = (
    i: number,
    patch: Partial<CeremonyScheduleItem>
  ) => {
    const updated = [...ceremonies];
    updated[i] = { ...updated[i], ...patch };
    onCeremoniesChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Landmark className="h-4 w-4" />
          {t('settings.ancestralHall.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.ancestralHall.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{t('settings.ancestralHall.address')}</Label>
          <Input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder={t('settings.placeholders.hallLocation')}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{t('settings.ancestralHall.history')}</Label>
          <Textarea
            value={history}
            onChange={(e) => onHistoryChange(e.target.value)}
            rows={3}
            placeholder={t('settings.placeholders.hallHistory')}
            className="mt-1"
          />
        </div>

        <div className="border-t pt-4 space-y-3">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('settings.ancestralHall.ceremonies')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('settings.ancestralHall.ceremoniesHint')}
          </p>
          {ceremonies.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <Input
                  placeholder={t('settings.placeholders.ceremonyName')}
                  value={c.title}
                  onChange={(e) =>
                    updateCeremony(i, { title: e.target.value })
                  }
                />
                <Input
                  placeholder={t('settings.placeholders.lunarDate')}
                  value={c.lunar_date ?? ''}
                  onChange={(e) =>
                    updateCeremony(i, {
                      lunar_date: e.target.value || undefined,
                    })
                  }
                />
                <Input
                  placeholder={t('settings.placeholders.solarDate')}
                  value={c.solar_date ?? ''}
                  onChange={(e) =>
                    updateCeremony(i, {
                      solar_date: e.target.value || undefined,
                    })
                  }
                />
                <Input
                  placeholder={t('settings.placeholders.note')}
                  value={c.description ?? ''}
                  onChange={(e) =>
                    updateCeremony(i, {
                      description: e.target.value || undefined,
                    })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() =>
                  onCeremoniesChange(ceremonies.filter((_, j) => j !== i))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCeremoniesChange([...ceremonies, { title: '' }])}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('settings.ancestralHall.addCeremony')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
