/**
 * @project AncestorTree
 * @file src/components/people/people-list-view.tsx
 * @description People list with Supabase search, filter, and pagination
 * @version 1.2.0
 * @updated 2026-07-19
 */

'use client';

import { useMemo, useState } from 'react';
import { useResettablePage } from '@hooks/use-resettable-page';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@components/ui';
import {
  PEOPLE_DEFAULT_PAGE_SIZE,
  type PeoplePageSize,
  type PeopleStatusFilter,
} from '@constants';
import {
  usePeopleFilterOptions,
  usePeopleList,
  useStats,
} from '@hooks';
import type { PeopleListFilters } from '@types';
import { PeopleFilters } from './people-filters';
import { PeoplePagination } from './people-pagination';
import { PersonCard } from './person-card';

function statusToIsLiving(
  status: PeopleStatusFilter
): boolean | null {
  if (status === 'living') return true;
  if (status === 'deceased') return false;
  return null;
}

export function PeopleListView() {
  const { isEditor } = useAuth();
  const { data: stats } = useStats();
  const { data: filterOptions } = usePeopleFilterOptions();

  const [search, setSearch] = useState('');
  const [generationFilter, setGenerationFilter] = useState('all');
  const [chiFilter, setChiFilter] = useState('all');
  const [statusFilter, setStatusFilter] =
    useState<PeopleStatusFilter>('all');
  const [pageSize, setPageSize] = useState<PeoplePageSize>(
    PEOPLE_DEFAULT_PAGE_SIZE
  );
  const [page, setPage] = useResettablePage(
    `${search}|${generationFilter}|${chiFilter}|${statusFilter}|${pageSize}`
  );

  const listFilters: PeopleListFilters = useMemo(
    () => ({
      search,
      generation:
        generationFilter === 'all' ? null : parseInt(generationFilter, 10),
      chi: chiFilter === 'all' ? null : parseInt(chiFilter, 10),
      isLiving: statusToIsLiving(statusFilter),
      ignoreAccents: true,
      page,
      pageSize,
    }),
    [search, generationFilter, chiFilter, statusFilter, page, pageSize]
  );

  const { data, isLoading, error, isFetching } = usePeopleList(listFilters);

  const generations = filterOptions?.generations ?? [];
  const chiValues = filterOptions?.chiValues ?? [];
  const people = data?.items ?? [];
  const total = data?.total ?? 0;

  const hasFilters =
    !!search ||
    generationFilter !== 'all' ||
    chiFilter !== 'all' ||
    statusFilter !== 'all';

  function clearFilters() {
    setSearch('');
    setGenerationFilter('all');
    setChiFilter('all');
    setStatusFilter('all');
    setPage(1);
  }

  function handlePageSizeChange(nextSize: PeoplePageSize) {
    setPageSize(nextSize);
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Lỗi khi tải dữ liệu: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6" />
            Thành viên
          </h1>
          <p className="text-muted-foreground">
            {stats
              ? `${stats.totalPeople} người trong ${stats.totalGenerations} đời`
              : 'Đang tải...'}
          </p>
        </div>
        {isEditor && (
          <Button asChild>
            <Link href="/people/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm mới
            </Link>
          </Button>
        )}
      </div>

      <PeopleFilters
        search={search}
        onSearchChange={setSearch}
        generationFilter={generationFilter}
        onGenerationFilterChange={setGenerationFilter}
        generations={generations}
        chiFilter={chiFilter}
        onChiFilterChange={setChiFilter}
        chiValues={chiValues}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />

      <div className="space-y-4">
        <PeoplePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          disabled={isLoading || isFetching}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : people.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {hasFilters ? (
                <>
                  <p>Không tìm thấy kết quả phù hợp</p>
                  <Button variant="link" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                </>
              ) : (
                <>
                  <p>Chưa có dữ liệu thành viên</p>
                  {isEditor && (
                    <Button asChild variant="link">
                      <Link href="/people/new">Thêm thành viên đầu tiên</Link>
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}

        {people.length > 0 && (
          <PeoplePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            disabled={isLoading || isFetching}
          />
        )}
      </div>
    </div>
  );
}
