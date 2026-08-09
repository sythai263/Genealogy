/**
 * @project AncestorTree
 * @file src/components/directory/directory-filters.tsx
 * @description Search and filter controls for the family directory
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  DIRECTORY_GENDER_FILTER_VALUES,
  DIRECTORY_STATUS_FILTER_VALUES,
  isDirectoryGenderFilter,
  isDirectoryStatusFilter,
} from '@constants';
import type { DirectoryGenderFilter, DirectoryStatusFilter } from '@types';

interface DirectoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  generationFilter: string;
  onGenerationFilterChange: (value: string) => void;
  generations: number[];
  genderFilter: DirectoryGenderFilter;
  onGenderFilterChange: (value: DirectoryGenderFilter) => void;
  statusFilter: DirectoryStatusFilter;
  onStatusFilterChange: (value: DirectoryStatusFilter) => void;
}

function genderFilterLabel(
  value: DirectoryGenderFilter,
  t: ReturnType<typeof useTranslations<'Directory'>>
): string {
  if (value === 'all') return t('filters.all');
  if (value === '1') return t('filters.male');
  return t('filters.female');
}

function statusFilterLabel(
  value: DirectoryStatusFilter,
  t: ReturnType<typeof useTranslations<'Directory'>>
): string {
  if (value === 'all') return t('filters.all');
  return t(`filters.${value}`);
}

export function DirectoryFilters({
  search,
  onSearchChange,
  generationFilter,
  onGenerationFilterChange,
  generations,
  genderFilter,
  onGenderFilterChange,
  statusFilter,
  onStatusFilterChange,
}: DirectoryFiltersProps) {
  const t = useTranslations('Directory');

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('filterTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={generationFilter}
            onValueChange={onGenerationFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('fields.generation')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allGenerations')}</SelectItem>
              {generations.map((generation) => (
                <SelectItem key={generation} value={String(generation)}>
                  {t('generationValue', { generation })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={genderFilter}
            onValueChange={(value) => {
              if (isDirectoryGenderFilter(value)) onGenderFilterChange(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.gender')} />
            </SelectTrigger>
            <SelectContent>
              {DIRECTORY_GENDER_FILTER_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {genderFilterLabel(value, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (isDirectoryStatusFilter(value)) onStatusFilterChange(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.status')} />
            </SelectTrigger>
            <SelectContent>
              {DIRECTORY_STATUS_FILTER_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {statusFilterLabel(value, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
