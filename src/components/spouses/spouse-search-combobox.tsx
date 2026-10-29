/**
 * @project AncestorTree
 * @file src/components/spouses/spouse-search-combobox.tsx
 * @description Search-or-create person combobox for the spouses worklist —
 *              input doubles as new-person name; Enter on a highlighted
 *              option quick-selects it (onEnterPerson), Enter with no
 *              highlight triggers create (onEnterCreate)
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { PersonGenderAvatar } from '@components/people';
import { Input } from '@components/ui';
import {
  PEOPLE_SEARCH_MIN_CHARS,
  SPOUSE_SEARCH_BLUR_CLOSE_MS,
} from '@constants';
import { useSearchPeopleAdvanced } from '@hooks';
import { cn } from '@lib';
import type { Person } from '@types';

interface SpouseSearchComboboxProps {
  /** Person to exclude from suggestions (the row's own person) */
  excludePersonId: string;
  /** Preferred gender — matching candidates sort first */
  expectedGender: 1 | 2;
  value: string;
  onQueryChange: (value: string) => void;
  /** Pick a candidate via mouse → fills the "selected" chip */
  onSelectPerson: (person: Person) => void;
  /** Enter on highlighted option → quick-pick (caller decides save vs fill) */
  onEnterPerson: (person: Person) => void;
  /** Enter with no highlighted option → create a new person from the query */
  onEnterCreate: () => void;
  placeholder: string;
  disabled: boolean;
  autoFocus: boolean;
}

export function SpouseSearchCombobox({
  excludePersonId,
  expectedGender,
  value,
  onQueryChange,
  onSelectPerson,
  onEnterPerson,
  onEnterCreate,
  placeholder,
  disabled,
  autoFocus,
}: SpouseSearchComboboxProps) {
  const t = useTranslations('Admin');
  const listboxId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const { data: results, isFetching } = useSearchPeopleAdvanced(value);

  const filtered = useMemo(() => {
    const matches = (results || []).filter(
      (candidate) => candidate.id !== excludePersonId
    );
    const preferred = matches.filter(
      (candidate) => candidate.gender === expectedGender
    );
    const others = matches.filter(
      (candidate) => candidate.gender !== expectedGender
    );
    return [...preferred, ...others];
  }, [results, excludePersonId, expectedGender]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const filterKey = `${value}:${filtered.length}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  }

  useEffect(() => {
    if (!open || highlightedIndex < 0 || !listRef.current) return;
    const option = listRef.current.querySelector<HTMLElement>(
      `[data-index="${highlightedIndex}"]`
    );
    option?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, open]);

  function handleSelectPerson(candidate: Person) {
    onSelectPerson(candidate);
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function handleQueryChange(next: string) {
    onQueryChange(next);
    setOpen(next.trim().length >= PEOPLE_SEARCH_MIN_CHARS);
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

    if (event.key === 'ArrowDown') {
      if (value.trim().length >= PEOPLE_SEARCH_MIN_CHARS) {
        event.preventDefault();
        setOpen(true);
        if (filtered.length > 0) {
          setHighlightedIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0
          );
        }
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      if (open && filtered.length > 0) {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
      }
      return;
    }

    if (event.key === 'Home' && open && filtered.length > 0) {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === 'End' && open && filtered.length > 0) {
      event.preventDefault();
      setHighlightedIndex(filtered.length - 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (open && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        onEnterPerson(filtered[highlightedIndex]);
        return;
      }
      onEnterCreate();
    }
  }

  const activeOptionId =
    open && highlightedIndex >= 0
      ? `${listboxId}-option-${highlightedIndex}`
      : undefined;

  return (
    <div className="relative min-w-0 flex-1">
      <div className="relative">
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          value={value}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            value.trim().length >= PEOPLE_SEARCH_MIN_CHARS && setOpen(true)
          }
          onBlur={() =>
            setTimeout(() => {
              setOpen(false);
              setHighlightedIndex(-1);
            }, SPOUSE_SEARCH_BLUR_CLOSE_MS)
          }
          placeholder={placeholder}
          disabled={disabled}
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
              {t('spouses.searching')}
            </p>
          )}
          {!isFetching &&
            filtered.length === 0 &&
            value.trim().length >= PEOPLE_SEARCH_MIN_CHARS && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                {t('spouses.notFoundCreate')}
              </p>
            )}
          {filtered.map((candidate, index) => (
            <button
              key={candidate.id}
              id={`${listboxId}-option-${index}`}
              data-index={index}
              type="button"
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={() => handleSelectPerson(candidate)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
                index === highlightedIndex ? 'bg-muted' : 'hover:bg-muted'
              )}
            >
              <PersonGenderAvatar
                gender={candidate.gender}
                name={candidate.display_name}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {candidate.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('spouses.generationLine', {
                    generation: candidate.generation,
                  })}
                  {candidate.birth_year ? ` · ${candidate.birth_year}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
