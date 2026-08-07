/**
 * @project AncestorTree
 * @file src/app/(main)/admin/spouses/page.tsx
 * @description Bulk entry worklist for families that are missing a spouse
 * @version 1.0.0
 * @updated 2026-08-07
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, ExternalLink, Heart, Loader2 } from 'lucide-react';
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
import { useCreatePerson, useCreateSpouseFamily, useFamiliesMissingSpouse } from '@hooks';
import { buildSpousePersonInput, cn } from '@lib';
import type { FamilyMissingSpouse } from '@lib';

const ALL_FILTER = 'all';

interface SpouseRowProps {
  entry: FamilyMissingSpouse;
  isSaved: boolean;
  autoFocus: boolean;
  onSave: (entry: FamilyMissingSpouse, fullName: string, birthYear?: number) => Promise<void>;
}

function SpouseRow({ entry, isSaved, autoFocus, onSave }: SpouseRowProps) {
  const [fullName, setFullName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { person, knownRole, childrenCount } = entry;
  const spouseLabel = knownRole === 'father' ? 'Vợ' : 'Chồng';

  useEffect(() => {
    if (autoFocus && !isSaved) nameInputRef.current?.focus();
  }, [autoFocus, isSaved]);

  async function handleSave() {
    const name = fullName.trim();
    if (!name || isSaving) return;
    const year = birthYear.trim() ? Number(birthYear.trim()) : undefined;
    if (year != null && !Number.isFinite(year)) {
      toast.error('Năm sinh không hợp lệ');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(entry, name, year);
    } finally {
      setIsSaving(false);
    }
  }

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
          <Input
            ref={nameInputRef}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSave();
              }
            }}
            placeholder={`Họ tên ${spouseLabel.toLowerCase()}`}
            disabled={isSaving}
            className="flex-1"
          />
          <Input
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSave();
              }
            }}
            placeholder="Năm sinh"
            inputMode="numeric"
            maxLength={4}
            disabled={isSaving}
            className="sm:w-28"
          />
          <Button
            onClick={() => void handleSave()}
            disabled={isSaving || !fullName.trim()}
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
    fullName: string,
    birthYear?: number
  ): Promise<void> {
    try {
      const spouse = await createPersonMutation.mutateAsync(
        buildSpousePersonInput({ fullName, birthYear, marriedTo: entry.person })
      );
      await createSpouseFamilyMutation.mutateAsync({
        personId: entry.person.id,
        personGender: entry.person.gender,
        spouseId: spouse.id,
      });

      setSavedIds((prev) => new Set(prev).add(entry.family_id));
      const position = visibleRows.findIndex((r) => r.family_id === entry.family_id);
      if (position >= 0) setActiveIndex(position + 1);
      toast.success(`Đã thêm ${fullName}`);
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
                  Nhấn <strong>Enter</strong> để lưu và chuyển sang dòng kế tiếp.
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
