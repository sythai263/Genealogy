/**
 * @project AncestorTree
 * @file src/components/spouses/admin-spouses-view.tsx
 * @description Admin bulk worklist for families missing a spouse
 * @version 2.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Heart } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  QueryBoundary,
} from '@components/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  PEOPLE_SEARCH_MIN_CHARS,
  SPOUSES_FILTER_ALL,
  type ListPageSize,
} from '@constants';
import {
  useCreatePerson,
  useCreateSpouseFamily,
  useFamiliesMissingSpouse,
  usePeopleFilterOptions,
  useResettablePage,
} from '@hooks';
import { buildSpousePersonInput } from '@lib';
import type { FamilyMissingSpouse, SpouseSavePayload } from '@types';
import { SpouseRow } from './spouse-row';

export function AdminSpousesView() {
  const { isEditor } = useAuth();
  const [chiFilter, setChiFilter] = useState(SPOUSES_FILTER_ALL);
  const [generationFilter, setGenerationFilter] = useState(SPOUSES_FILTER_ALL);
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(
    `${chiFilter}|${generationFilter}|${pageSize}`
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const chi = chiFilter === SPOUSES_FILTER_ALL ? undefined : Number(chiFilter);
  const generation =
    generationFilter === SPOUSES_FILTER_ALL ? undefined : Number(generationFilter);

  const { data, isLoading } = useFamiliesMissingSpouse({ chi, generation, page, pageSize });
  const { data: filterOptions } = usePeopleFilterOptions();
  const createPersonMutation = useCreatePerson();
  const createSpouseFamilyMutation = useCreateSpouseFamily();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const chiOptions = filterOptions?.chiValues ?? [];
  const generationOptions = filterOptions?.generations ?? [];

  async function handleSave(
    entry: FamilyMissingSpouse,
    payload: SpouseSavePayload
  ): Promise<void> {
    const position = items.findIndex((row) => row.family_id === entry.family_id);
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

      // Once saved, the family drops off the missing-spouse list on refetch —
      // the next row slides into the same position, so keep focus there.
      if (position >= 0) setActiveIndex(position);
      toast.success(
        linkedExisting ? `Đã liên kết ${toastName}` : `Đã thêm ${toastName}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu');
    }
  }

  if (!isEditor) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Heart className="h-6 w-6" />
          Nhập vợ/chồng
        </h1>
        <p className="text-muted-foreground">
          Các gia đình mới chỉ ghi nhận một bên. Nhập tên người còn lại để cây
          gia phả hiển thị đủ cặp vợ chồng.
        </p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={total === 0}
        emptyIcon={Check}
        emptyTitle="Mọi gia đình đều đã có đủ vợ chồng"
        skeletonRows={5}
      >
        <>
          <Card>
            <CardContent className="space-y-3 py-4">
              <p className="text-sm text-muted-foreground">
                Còn {total} gia đình cần nhập vợ/chồng
              </p>
              <div className="flex flex-wrap gap-2">
                <Select value={chiFilter} onValueChange={setChiFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Chi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SPOUSES_FILTER_ALL}>Tất cả chi</SelectItem>
                    {chiOptions.map((chiValue) => (
                      <SelectItem key={chiValue} value={String(chiValue)}>
                        Chi {chiValue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={generationFilter}
                  onValueChange={setGenerationFilter}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Đời" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SPOUSES_FILTER_ALL}>
                      Tất cả đời
                    </SelectItem>
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
            {items.map((entry, index) => (
              <SpouseRow
                key={entry.family_id}
                entry={entry}
                isSaved={false}
                autoFocus={index === activeIndex}
                onSave={handleSave}
              />
            ))}
          </div>

          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="gia đình"
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ghi chú</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="space-y-1 text-xs">
                <p>
                  Gõ từ <strong>{PEOPLE_SEARCH_MIN_CHARS} ký tự</strong> để tìm
                  thành viên có sẵn; chọn để liên kết. Không thấy thì nhập tên
                  mới (và năm sinh nếu có) rồi nhấn{' '}
                  <strong>Enter</strong>/<strong>Lưu</strong> để tạo.
                </p>
                <p>
                  Nhấn <strong>Enter</strong> để lưu và chuyển sang dòng kế tiếp.
                  Dùng ↑/↓ để duyệt kết quả tìm kiếm.
                </p>
                <p>
                  Người được tạo sẽ nhận cùng đời và chi với người phối ngẫu, cờ
                  chính tộc để tắt. Vợ/chồng được gắn thẳng vào gia đình sẵn có
                  nên các con hiện tại vẫn giữ nguyên.
                </p>
                <p>
                  Cần thêm vợ thứ hai hoặc sửa chi tiết: mở trang hồ sơ của từng
                  người.
                </p>
              </CardDescription>
            </CardContent>
          </Card>
        </>
      </QueryBoundary>
    </div>
  );
}
