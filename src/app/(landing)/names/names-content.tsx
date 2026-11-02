/**
 * @project AncestorTree
 * @file src/app/(landing)/names/names-content.tsx
 * @description Public name dictionary — keyword search (DB-side), gender +
 *              word-count filters, clan prefix picker, contribution dialog
 * @version 1.0.0
 * @updated 2026-10-30
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Baby, Plus, Search } from 'lucide-react';
import { NameCard, NameContributeDialog } from '@components/names';
import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@components/ui';
import { NAME_PREFIX_OPTIONS } from '@constants';
import { useNameSearch } from '@hooks';
import { cn } from '@lib';
import type { NameGender } from '@types';

export function NamesContent() {
  const t = useTranslations('Names');
  const [keyword, setKeyword] = useState('');
  const [gender, setGender] = useState<NameGender | 'all'>('male');
  const [wordCount, setWordCount] = useState<'all' | '3' | '4'>('all');
  const [prefix, setPrefix] = useState('Lê Sỹ');
  const [contributeOpen, setContributeOpen] = useState(false);

  const { data, isLoading, page, setPage } = useNameSearch({
    keyword,
    gender: gender === 'all' ? undefined : gender,
    nameWordCount:
      wordCount === 'all' ? undefined : wordCount === '3' ? 1 : 2,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 30));
  const isCustomPrefix = !NAME_PREFIX_OPTIONS.some((o) => o.label === prefix);

  function handlePrefixSelect(option: (typeof NAME_PREFIX_OPTIONS)[number]) {
    setPrefix(option.label);
    setGender(option.gender ?? 'all');
  }

  function handleCustomPrefix(value: string) {
    setPrefix(value);
    setGender('all');
  }

  function handleGenderChange(value: NameGender | 'all') {
    setGender(value);
    const current = NAME_PREFIX_OPTIONS.find((o) => o.label === prefix);
    if (value === 'all' || !current?.gender || current.gender === value) {
      return;
    }
    const replacement = NAME_PREFIX_OPTIONS.find((o) => o.gender === value);
    if (replacement) setPrefix(replacement.label);
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Baby className="h-7 w-7 text-emerald-600" />
          <h1 className="text-3xl font-bold text-foreground">
            {t('page.title')}
          </h1>
        </div>
        <p className="mx-auto max-w-xl text-muted-foreground">
          {t('page.subtitle')}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('search.placeholder')}
            className="pl-8"
          />
        </div>
        <Select
          value={gender}
          onValueChange={(v) => handleGenderChange(v as NameGender | 'all')}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allGenders')}</SelectItem>
            <SelectItem value="male">{t('filters.male')}</SelectItem>
            <SelectItem value="female">{t('filters.female')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={wordCount}
          onValueChange={(v) => setWordCount(v as 'all' | '3' | '4')}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allLengths')}</SelectItem>
            <SelectItem value="3">{t('filters.threeWords')}</SelectItem>
            <SelectItem value="4">{t('filters.fourWords')}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="ml-auto gap-1.5"
          onClick={() => setContributeOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {t('contribute.button')}
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {t('prefix.label')}:
        </span>
        {NAME_PREFIX_OPTIONS.map((option) => (
          <Badge
            key={option.label}
            variant={prefix === option.label ? 'default' : 'outline'}
            className={cn('cursor-pointer text-xs')}
            onClick={() => handlePrefixSelect(option)}
          >
            {option.label}
          </Badge>
        ))}
        <Badge
          variant={isCustomPrefix ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => handleCustomPrefix('')}
        >
          {t('prefix.custom')}
        </Badge>
        {isCustomPrefix && (
          <Input
            value={prefix}
            onChange={(e) => handleCustomPrefix(e.target.value)}
            placeholder={t('prefix.customPlaceholder')}
            className="h-7 w-44 text-sm"
          />
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {t('search.empty')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((entry) => (
            <NameCard key={entry.id} entry={entry} prefix={prefix} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ‹
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ›
          </Button>
        </div>
      )}

      <NameContributeDialog
        open={contributeOpen}
        onOpenChange={setContributeOpen}
      />
    </div>
  );
}
