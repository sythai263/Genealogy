/**
 * @project AncestorTree
 * @file src/components/people/quick-person-form.tsx
 * @description Minimal inline form for quickly creating a related person
 *              (spouse/child) from the family relations card
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Label } from '@components/ui';

export interface QuickPersonData {
  display_name: string;
  gender: 1 | 2;
  birth_year: string;
  generation: number;
}

interface QuickPersonFormProps {
  defaultGender?: 1 | 2;
  defaultGeneration: number;
  onSubmit: (data: QuickPersonData) => Promise<void>;
  isLoading: boolean;
}

export function QuickPersonForm({
  defaultGender = 1,
  defaultGeneration,
  onSubmit,
  isLoading,
}: QuickPersonFormProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<1 | 2>(defaultGender);
  const [birthYear, setBirthYear] = useState('');
  const [generation, setGeneration] = useState(defaultGeneration);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({
      display_name: name.trim(),
      gender,
      birth_year: birthYear,
      generation,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="qf-name">{t('form.firstName')} *</Label>
        <Input
          id="qf-name"
          placeholder={t('form.placeholders.displayName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>{t('form.gender')}</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGender(1)}
              className={`flex-1 ${
                gender === 1
                  ? 'border-blue-400 bg-blue-50 font-medium text-blue-700 hover:bg-blue-100 hover:text-blue-700'
                  : 'border-muted-foreground/30'
              }`}
            >
              {tCommon('male')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGender(2)}
              className={`flex-1 ${
                gender === 2
                  ? 'border-pink-400 bg-pink-50 font-medium text-pink-700 hover:bg-pink-100 hover:text-pink-700'
                  : 'border-muted-foreground/30'
              }`}
            >
              {tCommon('female')}
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="qf-year">{t('form.birthYear')}</Label>
          <Input
            id="qf-year"
            placeholder={t('form.placeholders.birthYear')}
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="qf-gen">{t('form.generation')}</Label>
        <Input
          id="qf-gen"
          type="number"
          min={1}
          max={20}
          value={generation}
          onChange={(e) => setGeneration(Number(e.target.value))}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !name.trim()}
      >
        {isLoading ? tCommon('saving') : tCommon('save')}
      </Button>
    </form>
  );
}
