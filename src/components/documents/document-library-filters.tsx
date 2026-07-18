/**
 * @project AncestorTree
 * @file src/components/documents/document-library-filters.tsx
 * @description Search and category filters for document library
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { Search } from 'lucide-react';
import { Button, Input } from '@components/ui';
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_CATEGORY_ORDER,
} from '@constants';
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
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative max-w-md flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm tài liệu..."
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
          Tất cả
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
            {DOCUMENT_CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>
    </div>
  );
}
