/**
 * @project AncestorTree
 * @file src/app/(main)/admin/spouses/page.tsx
 * @description Bulk entry worklist for families that are missing a spouse
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, ExternalLink, Heart, Loader2, Search, X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@components/ui';
import { useAuth } from '@components/auth';
import {
  useCreatePerson,
  useCreateSpouseFamily,
  useFamiliesMissingSpouse,
  useSearchPeopleAdvanced,
} from '@hooks';
import { buildSpousePersonInput, cn } from '@lib';
import type { FamilyMissingSpouse } from '@lib';
import type { Person } from '@types';

const ALL_FILTER = 'all';

type SpouseSavePayload =
  | { existingPersonId: string; displayName: string }
  | { fullName: string; birthYear?: number };

interface SpouseRowProps {
  entry: FamilyMissingSpouse;
  isSaved: boolean;
  autoFocus: boolean;
  onSave: (entry: FamilyMissingSpouse, payload: SpouseSavePayload) => Promise<void>;
}

function SpouseRow({ entry, isSaved, autoFocus, onSave }: SpouseRowProps) {
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
  const spouseLabel = knownRole === 'father' ? 'Vợ' : 'Chồng';
  const expectedGender: 1 | 2 = knownRole === 'father' ? 2 : 1;

  const { data: results, isFetching } = useSearchPeopleAdvanced(fullName);

  const filtered = useMemo(() => {
    const matches = (results || []).filter(
      (candidate) => candidate.id !== person.id
    );
    const preferred = matches.filter((candidate) => candidate.gender === expectedGender);
    const others = matches.filter((candidate) => candidate.gender !== expectedGender);
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
    setOpen(value.trim().length >= 2);
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
      toast.error('Năm sinh không hợp lệ');
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
      if (fullName.trim().length >= 2) {
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
          Đời {person.generation}
          {person.chi ? ` · Chi ${person.chi}` : ''} · {childrenCount} con
        </p>
      </div>

      {isSaved ? (
        <div className="flex flex-1 items-center gap-2 text-sm text-green-700">
          <Check className="h-4 w-4" />
          Đã lưu
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
                  Đời {selectedPerson.generation}
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
                  onFocus={() => fullName.trim().length >= 2 && setOpen(true)}
                  onBlur={() =>
                    setTimeout(() => {
                      setOpen(false);
                      setHighlightedIndex(-1);
                    }, 200)
                  }
                  placeholder={`Tìm hoặc nhập tên ${spouseLabel.toLowerCase()}`}
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
                      Đang tìm...
                    </p>
                  )}
                  {!isFetching &&
                    filtered.length === 0 &&
                    fullName.trim().length >= 2 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        Không tìm thấy — Enter để tạo mới
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
                          Đời {candidate.generation}
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
              placeholder="Năm sinh"
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
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminSpousesPage() {
  const { isEditor } = useAuth();
  const { data, isLoading } = useFamiliesMissingSpouse();
  const createPersonMutation = useCreatePerson();
  const createSpouseFamilyMutation = useCreateSpouseFamily();

  // Snapshot the worklist once so saving a row does not reshuffle the list
  // underneath the cursor when the query is invalidated.
  const [rows, setRows] = useState<FamilyMissingSpouse[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [chiFilter, setChiFilter] = useState(ALL_FILTER);
  const [generationFilter, setGenerationFilter] = useState(ALL_FILTER);
  const hasSnapshot = useRef(false);

  useEffect(() => {
    if (hasSnapshot.current || !data) return;
    hasSnapshot.current = true;
    setRows(data);
  }, [data]);

  const chiOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.person.chi).filter((c): c is number => c != null))].sort(
        (a, b) => a - b
      ),
    [rows]
  );
  const generationOptions = useMemo(
    () => [...new Set(rows.map((r) => r.person.generation))].sort((a, b) => a - b),
    [rows]
  );

  const visibleRows = useMemo(
    () =>
      rows.filter((r) => {
        if (chiFilter !== ALL_FILTER && String(r.person.chi ?? '') !== chiFilter) return false;
        if (generationFilter !== ALL_FILTER && String(r.person.generation) !== generationFilter) {
          return false;
        }
        return true;
      }),
    [rows, chiFilter, generationFilter]
  );

  async function handleSave(
    entry: FamilyMissingSpouse,
    payload: SpouseSavePayload
  ): Promise<void> {
    try {
      let spouseId: string;
      let toastName: string;
      let linkedExisting = false;

      if ('existingPersonId' in payload) {
        spouseId = payload.existingPersonId;
        toastName = payload.displayName;
        linkedExisting = true;
      } else {
        const spouse = await createPersonMutation.mutateAsync(
          buildSpousePersonInput({
            fullName: payload.fullName,
            birthYear: payload.birthYear,
            marriedTo: entry.person,
          })
        );
        spouseId = spouse.id;
        toastName = payload.fullName;
      }

      await createSpouseFamilyMutation.mutateAsync({
        personId: entry.person.id,
        personGender: entry.person.gender,
        spouseId,
        targetFamilyId: entry.family_id,
      });

      setSavedIds((prev) => new Set(prev).add(entry.family_id));
      const position = visibleRows.findIndex((r) => r.family_id === entry.family_id);
      if (position >= 0) setActiveIndex(position + 1);
      toast.success(
        linkedExisting ? `Đã liên kết ${toastName}` : `Đã thêm ${toastName}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu');
    }
  }

  if (!isEditor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Bạn cần quyền biên tập viên để truy cập trang này
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin">Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = rows.length;
  const savedCount = savedIds.size;
  const percent = total > 0 ? Math.round((savedCount / total) * 100) : 0;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Heart className="h-6 w-6" />
          Nhập vợ/chồng
        </h1>
        <p className="text-muted-foreground">
          Các gia đình mới chỉ ghi nhận một bên. Nhập tên người còn lại để cây gia phả hiển thị
          đủ cặp vợ chồng.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : total === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Check className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <p className="text-muted-foreground">Mọi gia đình đều đã có đủ vợ chồng</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="space-y-3 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Đã nhập {savedCount} / {total}
                </span>
                <Badge variant="outline">{percent}%</Badge>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-pink-400 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={chiFilter} onValueChange={setChiFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Chi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER}>Tất cả chi</SelectItem>
                    {chiOptions.map((chi) => (
                      <SelectItem key={chi} value={String(chi)}>
                        Chi {chi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={generationFilter} onValueChange={setGenerationFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Đời" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_FILTER}>Tất cả đời</SelectItem>
                    {generationOptions.map((gen) => (
                      <SelectItem key={gen} value={String(gen)}>
                        Đời {gen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {visibleRows.map((entry, index) => (
              <SpouseRow
                key={entry.family_id}
                entry={entry}
                isSaved={savedIds.has(entry.family_id)}
                autoFocus={index === activeIndex}
                onSave={handleSave}
              />
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ghi chú</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="space-y-1 text-xs">
                <p>
                  Gõ từ <strong>2 ký tự</strong> để tìm thành viên có sẵn; chọn để liên kết.
                  Không thấy thì nhập tên mới (và năm sinh nếu có) rồi nhấn{' '}
                  <strong>Enter</strong>/<strong>Lưu</strong> để tạo.
                </p>
                <p>
                  Nhấn <strong>Enter</strong> để lưu và chuyển sang dòng kế tiếp. Dùng ↑/↓ để
                  duyệt kết quả tìm kiếm.
                </p>
                <p>
                  Người được tạo sẽ nhận cùng đời và chi với người phối ngẫu, cờ chính tộc để
                  tắt. Vợ/chồng được gắn thẳng vào gia đình sẵn có nên các con hiện tại vẫn giữ
                  nguyên.
                </p>
                <p>Cần thêm vợ thứ hai hoặc sửa chi tiết: mở trang hồ sơ của từng người.</p>
              </CardDescription>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
