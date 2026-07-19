/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-toolbar.tsx
 * @description Search, chi filter, zoom, and focus-root controls for the tree
 * @version 2.0.0
 * @updated 2026-07-19
 */

'use client';

import { RotateCcw, Search, Undo2, ZoomIn, ZoomOut } from 'lucide-react';
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
import type { Person } from '@types';

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
}: FamilyTreeToolbarProps) {
  return (
    <div className="relative z-40 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-2">
      <div className="relative w-64" ref={searchContainerRef}>
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
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
          className="w-full rounded-md border bg-background py-1.5 pr-3 pl-8 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
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
                        'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                        isFocused ? 'bg-muted' : 'hover:bg-muted/50'
                      )}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={person.avatar_url || ''} />
                        <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                          {getInitials(person.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
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

      <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

      {chiValues.length > 0 && chiFilter != null && (
        <Select value={chiFilter} onValueChange={onChiFilterChange}>
          <SelectTrigger className="h-9 w-32 bg-background shadow-sm">
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

      {focusRootPerson && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-1">
          <span className="max-w-40 truncate text-sm font-medium">
            Đang xem: {focusRootPerson.display_name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2"
            onClick={onResetFocusRoot}
          >
            <Undo2 className="h-3.5 w-3.5" />
            Về gốc chính
          </Button>
        </div>
      )}

      <div className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onResetZoom}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-9 shadow-sm"
        onClick={onExpandAll}
      >
        Mở rộng tất cả
      </Button>
    </div>
  );
}
