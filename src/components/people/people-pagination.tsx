/**
 * @project AncestorTree
 * @file src/components/people/people-pagination.tsx
 * @description Page size and page navigation for people list
 * @version 1.0.0
 * @updated 2026-07-19
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
  PEOPLE_PAGE_SIZE_OPTIONS,
  isPeoplePageSize,
  type PeoplePageSize,
} from '@constants';

interface PeoplePaginationProps {
  page: number;
  pageSize: PeoplePageSize;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PeoplePageSize) => void;
  disabled?: boolean;
}

export function PeoplePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: PeoplePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? 'Không có kết quả'
          : `Hiển thị ${from}–${to} / ${total} người`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mỗi trang</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const size = Number(value);
              if (isPeoplePageSize(size)) onPageSizeChange(size);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PEOPLE_PAGE_SIZE_OPTIONS.map((size) => (
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
