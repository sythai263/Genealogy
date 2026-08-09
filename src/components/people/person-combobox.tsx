/**
 * @project AncestorTree
 * @file src/components/people/person-combobox.tsx
 * @description Searchable person picker with keyboard navigation
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button, Input } from '@components/ui';
import { useSearchPeople } from '@hooks';
import { cn } from '@lib';
import type { Person } from '@types';

interface PersonComboboxProps {
  label: string;
  selected: Person | null;
  onSelect: (person: Person | null) => void;
  excludeId?: string;
}

export function PersonCombobox({
  label,
  selected,
  onSelect,
  excludeId,
}: PersonComboboxProps) {
  const listboxId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { data: results, isFetching } = useSearchPeople(query);

  const filtered = (results || []).filter((person) => person.id !== excludeId);

  useEffect(() => {
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  }, [query, filtered.length]);

  useEffect(() => {
    if (!open || highlightedIndex < 0 || !listRef.current) return;
    const option = listRef.current.querySelector<HTMLElement>(
      `[data-index="${highlightedIndex}"]`
    );
    option?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, open]);

  function handleSelect(person: Person) {
    onSelect(person);
    setQuery('');
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function handleClear() {
    onSelect(null);
    setQuery('');
    setHighlightedIndex(-1);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setOpen(value.length >= 2);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }

    if (!open || filtered.length === 0) {
      if (
        (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
        query.length >= 2
      ) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleSelect(filtered[highlightedIndex]);
      }
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setHighlightedIndex(filtered.length - 1);
    }
  }

  const activeOptionId =
    open && highlightedIndex >= 0
      ? `${listboxId}-option-${highlightedIndex}`
      : undefined;

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {selected ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
              selected.gender === 1
                ? 'bg-blue-100 text-blue-700'
                : 'bg-pink-100 text-pink-700'
            )}
          >
            {selected.display_name.slice(-1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {selected.display_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Đời {selected.generation}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
              placeholder={`Tìm ${label.toLowerCase()}...`}
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length >= 2 && setOpen(true)}
              onBlur={() =>
                setTimeout(() => {
                  setOpen(false);
                  setHighlightedIndex(-1);
                }, 200)
              }
              className="pl-9"
            />
          </div>
          {open && (
            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-background shadow-lg"
            >
              {isFetching && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Đang tìm...
                </p>
              )}
              {!isFetching && filtered.length === 0 && query.length >= 2 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Không tìm thấy
                </p>
              )}
              {filtered.map((person, index) => (
                <button
                  key={person.id}
                  id={`${listboxId}-option-${index}`}
                  data-index={index}
                  type="button"
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onMouseDown={() => handleSelect(person)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
                    index === highlightedIndex
                      ? 'bg-muted'
                      : 'hover:bg-muted'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                      person.gender === 1
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-pink-100 text-pink-700'
                    )}
                  >
                    {person.display_name.slice(-1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{person.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Đời {person.generation}
                      {person.birth_year ? ` · ${person.birth_year}` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
