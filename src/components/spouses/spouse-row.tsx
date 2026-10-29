/**
 * @project AncestorTree
 * @file src/components/spouses/spouse-row.tsx
 * @description Single missing-spouse worklist row — identity, search-or-create
 *              combobox, birth year, save. Combobox machinery lives in
 *              spouse-search-combobox.
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Check, ExternalLink, Loader2, X } from 'lucide-react';
import { PersonGenderAvatar } from '@components/people';
import { Button, Input } from '@components/ui';
import { cn } from '@lib';
import type { FamilyMissingSpouse, Person, SpouseSavePayload } from '@types';
import { SpouseSearchCombobox } from './spouse-search-combobox';

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

  const [fullName, setFullName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { person, knownRole, childrenCount } = entry;
  const spouseLabel =
    knownRole === 'father' ? t('spouses.wife') : t('spouses.husband');
  const expectedGender: 1 | 2 = knownRole === 'father' ? 2 : 1;

  function handleSelectPerson(candidate: Person) {
    setSelectedPerson(candidate);
    setFullName('');
    setBirthYear('');
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

  const canSave = selectedPerson != null || fullName.trim().length > 0;

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
              <PersonGenderAvatar
                gender={selectedPerson.gender}
                name={selectedPerson.display_name}
              />
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
                onClick={() => {
                  setSelectedPerson(null);
                  setFullName('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <SpouseSearchCombobox
              excludePersonId={person.id}
              expectedGender={expectedGender}
              value={fullName}
              onQueryChange={setFullName}
              onSelectPerson={handleSelectPerson}
              onEnterPerson={(candidate) =>
                void persist({
                  existingPersonId: candidate.id,
                  displayName: candidate.display_name,
                })
              }
              onEnterCreate={() => void handleSave()}
              placeholder={t('spouses.searchPlaceholder', {
                label: spouseLabel.toLowerCase(),
              })}
              disabled={isSaving}
              autoFocus={autoFocus && !isSaved}
            />
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
