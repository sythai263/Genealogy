/**
 * @project AncestorTree
 * @file src/components/documents/document-library-view.tsx
 * @description Kho tài liệu — gallery view with category filter and search
 * @version 1.0.0
 * @updated 2026-07-27
 */

'use client';

import { useMemo, useState } from 'react';
import { useResettablePage } from '@hooks';
import Link from 'next/link';
import { Archive, ArrowLeft, Info } from 'lucide-react';
import { useAuth } from '@components/auth';
import { ListPagination, PageHeader, QueryBoundary } from '@components/shared';
import { Button } from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import { useDocumentFileUrls, useDocuments, usePeopleByIds } from '@hooks';
import type { DocumentCategory } from '@types';
import { DocumentLibraryCard } from './document-library-card';
import { DocumentLibraryFilters } from './document-library-filters';

export function DocumentLibraryView() {
  const [categoryFilter, setCategoryFilter] = useState<
    DocumentCategory | undefined
  >();
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(`${categoryFilter}|${search}|${pageSize}`);

  const { data, isLoading } = useDocuments({
    category: categoryFilter,
    search: search || undefined,
    page,
    pageSize,
  });
  const { profile } = useAuth();
  const isViewer = profile?.role === 'viewer';

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [...new Set(items.map((doc) => doc.person_id).filter((id): id is string => Boolean(id)))],
    [items]
  );
  const fileRefs = useMemo(() => items.map((doc) => doc.file_url), [items]);
  const { data: fileUrls } = useDocumentFileUrls(fileRefs);

  const { data: people } = usePeopleByIds(personIds);
  const peopleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const person of people || []) {
      map.set(person.id, person.display_name);
    }
    return map;
  }, [people]);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documents">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Tài liệu
            </Link>
          </Button>
        </div>
        <PageHeader
          className="mb-2"
          icon={Archive}
          title="Kho tài liệu"
          description="Ảnh lịch sử, giấy tờ, bản đồ, video — ký ức dòng họ"
        />
      </div>

      {isViewer && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Bạn đang xem tài liệu công khai. Một số tài liệu chỉ dành cho thành
            viên quản trị.
          </span>
        </div>
      )}

      <DocumentLibraryFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={items.length === 0}
        emptyIcon={Archive}
        emptyTitle={
          search || categoryFilter
            ? 'Không tìm thấy tài liệu phù hợp'
            : 'Chưa có tài liệu nào'
        }
        skeletonVariant="grid"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((document) => (
              <DocumentLibraryCard
                key={document.id}
                document={document}
                fileUrl={fileUrls?.[document.file_url]}
                personName={
                  document.person_id
                    ? peopleMap.get(document.person_id)
                    : undefined
                }
              />
            ))}
          </div>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="tài liệu"
          />
        </div>
      </QueryBoundary>
    </div>
  );
}
