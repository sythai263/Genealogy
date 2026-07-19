/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-toolbar.tsx
 * @description Search, chi filter, zoom, orientation, and focus-root controls
 * @version 2.2.0
 * @updated 2026-07-19
 */

'use client';

import {
  ArrowDownFromLine,
  ArrowRightFromLine,
  Maximize2,
  RotateCcw,
  Search,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import { TREE_SEARCH_MIN_CHARS } from '@constants';
import { cn, getInitials } from '@lib';
import type { Person, TreeOrientation } from '@types';

interface FamilyTreeToolbarProps {
  filterSearch: string;
  onFilterSearchChange: (value: string) => void;
  filterDropdownOpen: boolean;
  onFilterDropdownOpenChange: (open: boolean) => void;
  debouncedSearch: string;
  searchResults: Person[] | undefined;
  isSearching: boolean;
  focusedIndex: number;
  onFocusedIndexChange: (index: number) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocusPerson: (person: Person) => void;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  chiValues: number[];
  chiFilter: string | null;
  onChiFilterChange: (value: string) => void;
  focusRootPerson: Person | null;
  onResetFocusRoot: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onExpandAll: () => void;
  orientation: TreeOrientation;
  onOrientationChange: (orientation: TreeOrientation) => void;
  /** Tighter layout for public / mobile landing. */
  compact?: boolean;
}

export function FamilyTreeToolbar({
  filterSearch,
  onFilterSearchChange,
  filterDropdownOpen,
  onFilterDropdownOpenChange,
  debouncedSearch,
  searchResults,
  isSearching,
  focusedIndex,
  onFocusedIndexChange,
  onSearchKeyDown,
  onFocusPerson,
  searchContainerRef,
  chiValues,
  chiFilter,
  onChiFilterChange,
  focusRootPerson,
  onResetFocusRoot,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExpandAll,
  orientation,
  onOrientationChange,
  compact = false,
}: FamilyTreeToolbarProps) {
  return (
    <div
      className={cn(
        'relative z-40 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-2 sm:gap-3',
        compact &&
          'rounded-none border-x-0 border-t-0 bg-background/95 backdrop-blur sm:rounded-lg sm:border'
      )}
    >
      <div
        className={cn(
          'relative min-w-0 flex-1 basis-full sm:basis-auto sm:w-64',
          compact && 'sm:flex-none'
        )}
        ref={searchContainerRef}
      >
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Tìm theo tên..."
          value={filterSearch}
          onChange={(event) => {
            onFilterSearchChange(event.target.value);
            onFilterDropdownOpenChange(
              event.target.value.length >= TREE_SEARCH_MIN_CHARS
            );
          }}
          onFocus={() => {
            if (filterSearch.length >= TREE_SEARCH_MIN_CHARS) {
              onFilterDropdownOpenChange(true);
            }
          }}
          onKeyDown={onSearchKeyDown}
          className="h-10 w-full rounded-md border bg-background py-2 pr-3 pl-8 text-base shadow-sm focus:ring-2 focus:ring-primary focus:outline-none sm:h-9 sm:py-1.5 sm:text-sm"
        />

        {filterDropdownOpen &&
          debouncedSearch.length >= TREE_SEARCH_MIN_CHARS && (
            <div className="absolute top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
              {isSearching ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((person, index) => {
                  const isFocused = index === focusedIndex;
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onFocusPerson(person);
                      }}
                      onMouseEnter={() => onFocusedIndexChange(index)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors sm:py-2',
                        isFocused ? 'bg-muted' : 'hover:bg-muted/50'
                      )}
                    >
                      <Avatar className="h-7 w-7 sm:h-6 sm:w-6">
                        <AvatarImage src={person.avatar_url || ''} />
                        <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                          {getInitials(person.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 flex-col">
                        <p className="truncate text-sm font-medium">
                          {person.display_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Chi {person.chi} - Đời {person.generation}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          )}
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-none">
        {chiValues.length > 0 && chiFilter != null && (
          <Select value={chiFilter} onValueChange={onChiFilterChange}>
            <SelectTrigger className="h-10 w-[7.5rem] bg-background shadow-sm sm:h-9 sm:w-32">
              <SelectValue placeholder="Chọn chi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi</SelectItem>
              {chiValues.map((chi) => (
                <SelectItem key={chi} value={String(chi)}>
                  Chi {chi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div
          className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-sm"
          role="group"
          aria-label="Hướng cây"
        >
          <Button
            variant={orientation === 'horizontal' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 sm:h-7 sm:w-7"
            onClick={() => onOrientationChange('horizontal')}
            aria-label="Hiển thị ngang"
            aria-pressed={orientation === 'horizontal'}
            title="Ngang (trái → phải)"
          >
            <ArrowRightFromLine className="h-4 w-4" />
          </Button>
          <Button
            variant={orientation === 'vertical' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 sm:h-7 sm:w-7"
            onClick={() => onOrientationChange('vertical')}
            aria-label="Hiển thị dọc"
            aria-pressed={orientation === 'vertical'}
            title="Dọc (trên → dưới)"
          >
            <ArrowDownFromLine className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm sm:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-7 sm:w-7"
            onClick={onZoomOut}
            aria-label="Thu nhỏ"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-7 sm:w-7"
            onClick={onZoomIn}
            aria-label="Phóng to"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-7 sm:w-7"
            onClick={onResetZoom}
            aria-label="Đặt lại zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-1.5 shadow-sm sm:h-9"
          onClick={onExpandAll}
        >
          <Maximize2 className="h-3.5 w-3.5 sm:hidden" />
          <span className="sm:hidden">Mở rộng</span>
          <span className="hidden sm:inline">Mở rộng tất cả</span>
        </Button>
      </div>

      {focusRootPerson && (
        <div className="flex w-full items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 sm:w-auto">
          <span className="min-w-0 flex-1 truncate text-sm font-medium sm:max-w-40 sm:flex-none">
            Đang xem: {focusRootPerson.display_name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2 sm:h-7"
            onClick={onResetFocusRoot}
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Về gốc</span>
          </Button>
        </div>
      )}
    </div>
  );
}
