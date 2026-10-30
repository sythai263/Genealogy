/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-search.tsx
 * @description Person search widget for the family tree toolbar — input +
 *              dropdown result list with keyboard-focus highlighting
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
} from '@components/ui';
import { TREE_SEARCH_MIN_CHARS } from '@constants';
import { cn, getInitials } from '@lib';
import type { Person } from '@types';

interface FamilyTreeSearchProps {
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
  compact?: boolean;
}

export function FamilyTreeSearch({
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
  compact = false,
}: FamilyTreeSearchProps) {
  const t = useTranslations('Tree');

  return (
    <div
      className={cn(
        'relative min-w-0 flex-1 basis-full sm:w-64 sm:basis-auto',
        compact && 'sm:flex-none'
      )}
      ref={searchContainerRef}
    >
      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder={t('searchPlaceholder')}
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
        className="h-8 bg-background pr-3 pl-8 text-sm sm:h-9"
      />

      {filterDropdownOpen &&
        debouncedSearch.length >= TREE_SEARCH_MIN_CHARS && (
          <div className="absolute top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
            {isSearching ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                {t('toolbar.searching')}
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
                        {t('toolbar.chiGeneration', {
                          chi: person.chi ?? '',
                          generation: person.generation,
                        })}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-sm text-muted-foreground">
                {t('toolbar.noResults')}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
