/**
 * @project AncestorTree
 * @file src/components/people/person-combobox.tsx
 * @description Searchable person picker for parent selection
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button, Input } from '@components/ui';
import { useSearchPeople } from '@hooks';
import { cn } from '@lib/utils';
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
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { data: results, isFetching } = useSearchPeople(query);

  const filtered = (results || []).filter((person) => person.id !== excludeId);

  function handleSelect(person: Person) {
    onSelect(person);
    setQuery('');
    setOpen(false);
  }

  function handleClear() {
    onSelect(null);
    setQuery('');
  }

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
              placeholder={`Tìm ${label.toLowerCase()}...`}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(event.target.value.length >= 2);
              }}
              onFocus={() => query.length >= 2 && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="pl-9"
            />
          </div>
          {open && (
            <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
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
              {filtered.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onMouseDown={() => handleSelect(person)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted"
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
