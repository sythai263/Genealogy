/**
 * @project AncestorTree
 * @file src/components/shared/list-pagination.tsx
 * @description Reusable page size + prev/next controls for backend-paginated lists
 * @version 1.0.0
 * @updated 2026-07-27
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  LIST_PAGE_SIZE_OPTIONS,
  isListPageSize,
  type ListPageSize,
} from '@constants';

interface ListPaginationProps {
  page: number;
  pageSize: ListPageSize;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: ListPageSize) => void;
  /** Noun in Vietnamese for the range label, e.g. "người", "bài viết" */
  itemLabel?: string;
  disabled?: boolean;
}

export function ListPagination({
  page,
  pageSize = LIST_DEFAULT_PAGE_SIZE,
  total,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'kết quả',
  disabled = false,
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? 'Không có kết quả'
          : `Hiển thị ${from}–${to} / ${total} ${itemLabel}`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mỗi trang</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const size = Number(value);
              if (isListPageSize(size)) onPageSizeChange(size);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIST_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-20 px-2 text-center text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
