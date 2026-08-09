/**
 * @project AncestorTree
 * @file src/components/people/people-filters.tsx
 * @description Search and filter controls for the people list
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { Filter, Search, X } from 'lucide-react';
import {
  Button,
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
  PEOPLE_STATUS_FILTER_VALUES,
  isPeopleStatusFilter,
  type PeopleStatusFilter,
} from '@constants';

interface PeopleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  generationFilter: string;
  onGenerationFilterChange: (value: string) => void;
  generations: number[];
  chiFilter: string;
  onChiFilterChange: (value: string) => void;
  chiValues: number[];
  statusFilter: PeopleStatusFilter;
  onStatusFilterChange: (value: PeopleStatusFilter) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function PeopleFilters({
  search,
  onSearchChange,
  generationFilter,
  onGenerationFilterChange,
  generations,
  chiFilter,
  onChiFilterChange,
  chiValues,
  statusFilter,
  onStatusFilterChange,
  hasFilters,
  onClearFilters,
}: PeopleFiltersProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          {t('filters.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            value={generationFilter}
            onValueChange={onGenerationFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.generation')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allGenerations')}</SelectItem>
              {generations.map((generation) => (
                <SelectItem key={generation} value={generation.toString()}>
                  {t('generationN', { n: generation })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={chiFilter} onValueChange={onChiFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('filters.chi')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allChi')}</SelectItem>
              {chiValues.map((chi) => (
                <SelectItem key={chi} value={chi.toString()}>
                  {t('chiN', { n: chi })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (isPeopleStatusFilter(value)) onStatusFilterChange(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.status')} />
            </SelectTrigger>
            <SelectContent>
              {PEOPLE_STATUS_FILTER_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value === 'all'
                    ? tCommon('all')
                    : value === 'living'
                      ? tCommon('living')
                      : tCommon('deceased')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            {t('clearFilters')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
