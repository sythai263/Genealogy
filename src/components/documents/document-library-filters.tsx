/**
 * @project AncestorTree
 * @file src/components/documents/document-library-filters.tsx
 * @description Search and category filters for document library
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Button, Input } from '@components/ui';
import { DOCUMENT_CATEGORY_ORDER } from '@constants';
import type { DocumentCategory } from '@types';

interface DocumentLibraryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter?: DocumentCategory;
  onCategoryFilterChange: (value: DocumentCategory | undefined) => void;
}

export function DocumentLibraryFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
}: DocumentLibraryFiltersProps) {
  const t = useTranslations('Documents');
  const tCommon = useTranslations('Common');

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative max-w-md flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('library.searchPlaceholder')}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={categoryFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryFilterChange(undefined)}
        >
          {tCommon('all')}
        </Button>
        {DOCUMENT_CATEGORY_ORDER.map((category) => (
          <Button
            key={category}
            variant={categoryFilter === category ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              onCategoryFilterChange(
                category === categoryFilter ? undefined : category
              )
            }
          >
            {t(`categories.${category}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}
