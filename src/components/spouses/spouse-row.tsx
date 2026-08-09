/**
 * @project AncestorTree
 * @file src/components/spouses/spouse-row.tsx
 * @description Single missing-spouse worklist row with search-or-create
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Check, ExternalLink, Loader2, Search, X } from 'lucide-react';
import { Button, Input } from '@components/ui';
import {
  PEOPLE_SEARCH_MIN_CHARS,
  SPOUSE_SEARCH_BLUR_CLOSE_MS,
} from '@constants';
import { useSearchPeopleAdvanced } from '@hooks';
import { cn } from '@lib';
import type { FamilyMissingSpouse, Person, SpouseSavePayload } from '@types';

interface SpouseRowProps {
  entry: FamilyMissingSpouse;
  isSaved: boolean;
  autoFocus: boolean;
  onSave: (
    entry: FamilyMissingSpouse,
    payload: SpouseSavePayload
  ) => Promise<void>;
}

export function SpouseRow({
  entry,
  isSaved,
  autoFocus,
  onSave,
}: SpouseRowProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const listboxId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);

  const { person, knownRole, childrenCount } = entry;
  const spouseLabel =
    knownRole === 'father' ? t('spouses.wife') : t('spouses.husband');
  const expectedGender: 1 | 2 = knownRole === 'father' ? 2 : 1;

  const { data: results, isFetching } = useSearchPeopleAdvanced(fullName);

  const filtered = useMemo(() => {
    const matches = (results || []).filter(
      (candidate) => candidate.id !== person.id
    );
    const preferred = matches.filter(
      (candidate) => candidate.gender === expectedGender
    );
    const others = matches.filter(
      (candidate) => candidate.gender !== expectedGender
    );
    return [...preferred, ...others];
  }, [results, person.id, expectedGender]);

  useEffect(() => {
    if (autoFocus && !isSaved) nameInputRef.current?.focus();
  }, [autoFocus, isSaved]);

  useEffect(() => {
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  }, [fullName, filtered.length]);

  useEffect(() => {
    if (!open || highlightedIndex < 0 || !listRef.current) return;
    const option = listRef.current.querySelector<HTMLElement>(
      `[data-index="${highlightedIndex}"]`
    );
    option?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, open]);

  function handleSelectPerson(candidate: Person) {
    setSelectedPerson(candidate);
    setFullName('');
    setBirthYear('');
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function handleClearSelected() {
    setSelectedPerson(null);
    setFullName('');
  }

  function handleQueryChange(value: string) {
    setFullName(value);
    setOpen(value.trim().length >= PEOPLE_SEARCH_MIN_CHARS);
  }

  async function persist(payload: SpouseSavePayload) {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(entry, payload);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave() {
    if (selectedPerson) {
      await persist({
        existingPersonId: selectedPerson.id,
        displayName: selectedPerson.display_name,
      });
      return;
    }

    const name = fullName.trim();
    if (!name) return;
    const year = birthYear.trim() ? Number(birthYear.trim()) : undefined;
    if (year != null && !Number.isFinite(year)) {
      toast.error(t('spouses.birthYearInvalid'));
      return;
    }
    await persist({ fullName: name, birthYear: year });
  }

  function handleNameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      if (fullName.trim().length >= PEOPLE_SEARCH_MIN_CHARS) {
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
        const candidate = filtered[highlightedIndex];
        void persist({
          existingPersonId: candidate.id,
          displayName: candidate.display_name,
        });
        return;
      }
      void handleSave();
    }
  }

  const canSave = selectedPerson != null || fullName.trim().length > 0;
  const activeOptionId =
    open && highlightedIndex >= 0
      ? `${listboxId}-option-${highlightedIndex}`
      : undefined;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center',
        isSaved && 'border-green-200 bg-green-50'
      )}
    >
      <div className="min-w-0 sm:w-64">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{person.display_name}</p>
          <Button variant="ghost" size="sm" className="h-6 shrink-0 px-1" asChild>
            <Link href={`/people/${person.id}`} target="_blank">
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('spouses.generationLine', { generation: person.generation })}
          {person.chi
            ? t('spouses.chiSuffix', { chi: person.chi })
            : ''}{' '}
          · {t('spouses.childrenCount', { count: childrenCount })}
        </p>
      </div>

      {isSaved ? (
        <div className="flex flex-1 items-center gap-2 text-sm text-green-700">
          <Check className="h-4 w-4" />
          {t('spouses.saved')}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {selectedPerson ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-muted/50 p-2">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  selectedPerson.gender === 1
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-pink-100 text-pink-700'
                )}
              >
                {selectedPerson.display_name.slice(-1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {selectedPerson.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('spouses.generationLine', {
                    generation: selectedPerson.generation,
                  })}
                  {selectedPerson.birth_year
                    ? ` · ${selectedPerson.birth_year}`
                    : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={isSaving}
                onClick={handleClearSelected}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="relative min-w-0 flex-1">
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={nameInputRef}
                  role="combobox"
                  aria-expanded={open}
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  aria-activedescendant={activeOptionId}
                  value={fullName}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onFocus={() =>
                    fullName.trim().length >= PEOPLE_SEARCH_MIN_CHARS &&
                    setOpen(true)
                  }
                  onBlur={() =>
                    setTimeout(() => {
                      setOpen(false);
                      setHighlightedIndex(-1);
                    }, SPOUSE_SEARCH_BLUR_CLOSE_MS)
                  }
                  placeholder={t('spouses.searchPlaceholder', {
                    label: spouseLabel.toLowerCase(),
                  })}
                  disabled={isSaving}
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
                    fullName.trim().length >= PEOPLE_SEARCH_MIN_CHARS && (
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
                        index === highlightedIndex
                          ? 'bg-muted'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                          candidate.gender === 1
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        )}
                      >
                        {candidate.display_name.slice(-1)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {candidate.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('spouses.generationLine', {
                            generation: candidate.generation,
                          })}
                          {candidate.birth_year
                            ? ` · ${candidate.birth_year}`
                            : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedPerson && (
            <Input
              value={birthYear}
              onChange={(event) =>
                setBirthYear(event.target.value.replace(/\D/g, ''))
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSave();
                }
              }}
              placeholder={t('spouses.birthYear')}
              inputMode="numeric"
              maxLength={4}
              disabled={isSaving}
              className="sm:w-28"
            />
          )}

          <Button
            onClick={() => void handleSave()}
            disabled={isSaving || !canSave}
            size="sm"
            className="sm:w-24"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              tCommon('save')
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
