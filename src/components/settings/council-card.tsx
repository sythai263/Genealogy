/**
 * @project AncestorTree
 * @file src/components/settings/council-card.tsx
 * @description Council members editor card — add/remove member rows
 *              (name, title, phone)
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Plus, Trash2, Users } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@components/ui';
import type { CouncilMember } from '@types';

interface CouncilCardProps {
  members: CouncilMember[];
  onChange: (members: CouncilMember[]) => void;
}

export function CouncilCard({ members, onChange }: CouncilCardProps) {
  const t = useTranslations('Admin');

  const updateMember = (i: number, patch: Partial<CouncilMember>) => {
    const updated = [...members];
    updated[i] = { ...updated[i], ...patch };
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t('settings.council.title')}
        </CardTitle>
        <CardDescription>{t('settings.council.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.map((m, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                placeholder={t('settings.placeholders.councilName')}
                value={m.name}
                onChange={(e) => updateMember(i, { name: e.target.value })}
              />
              <Input
                placeholder={t('settings.placeholders.councilRole')}
                value={m.title}
                onChange={(e) => updateMember(i, { title: e.target.value })}
              />
              <Input
                placeholder={t('settings.placeholders.councilPhone')}
                value={m.phone ?? ''}
                onChange={(e) =>
                  updateMember(i, { phone: e.target.value || undefined })
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => onChange(members.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...members, { name: '', title: '' }])}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('settings.council.addMember')}
        </Button>
      </CardContent>
    </Card>
  );
}
