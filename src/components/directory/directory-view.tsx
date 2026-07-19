/**
 * @project AncestorTree
 * @file src/components/directory/directory-view.tsx
 * @description Family directory with contacts, server-side search, filters, pagination
 * @version 1.1.0
 * @updated 2026-07-19
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookUser } from 'lucide-react';
import { useAuth } from '@components/auth';
import { Card, CardContent } from '@components/ui';
import { PeoplePagination } from '@components/people';
import {
  PEOPLE_DEFAULT_PAGE_SIZE,
  type PeoplePageSize,
} from '@constants';
import {
  usePeopleFilterOptions,
  usePeopleList,
} from '@hooks';
import type {
  DirectoryGenderFilter,
  DirectoryStatusFilter,
  PeopleListFilters,
  Person,
} from '@types';
import { DirectoryFilters } from './directory-filters';
import { DirectoryTable } from './directory-table';
import { getContactDisplay } from './get-contact-display';

function statusToIsLiving(
  status: DirectoryStatusFilter
): boolean | null {
  if (status === 'living') return true;
  if (status === 'deceased') return false;
  return null;
}

function genderToFilter(
  gender: DirectoryGenderFilter
): number | null {
  if (gender === 'all') return null;
  return Number(gender);
}

export function DirectoryView() {
  const { user, profile } = useAuth();
  const isAuthenticated = !!user;
  const isViewer = profile?.role === 'viewer';

  const { data: filterOptions } = usePeopleFilterOptions();

  const [search, setSearch] = useState('');
  const [generationFilter, setGenerationFilter] = useState('all');
  const [genderFilter, setGenderFilter] =
    useState<DirectoryGenderFilter>('all');
  const [statusFilter, setStatusFilter] =
    useState<DirectoryStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PeoplePageSize>(
    PEOPLE_DEFAULT_PAGE_SIZE
  );

  const listFilters: PeopleListFilters = useMemo(
    () => ({
      search,
      generation:
        generationFilter === 'all' ? null : parseInt(generationFilter, 10),
      chi: null,
      isLiving: statusToIsLiving(statusFilter),
      gender: genderToFilter(genderFilter),
      ignoreAccents: true,
      page,
      pageSize,
    }),
    [search, generationFilter, genderFilter, statusFilter, page, pageSize]
  );

  const { data, isLoading, error, isFetching } = usePeopleList(listFilters);

  const generations = filterOptions?.generations ?? [];
  const people = data?.items ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search, generationFilter, genderFilter, statusFilter, pageSize]);

  function handlePageSizeChange(nextSize: PeoplePageSize) {
    setPageSize(nextSize);
  }

  function resolveContact(person: Person) {
    return getContactDisplay({
      person,
      isAuthenticated,
      isViewer: !!isViewer,
      linkedPersonId: profile?.linked_person,
    });
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <BookUser className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Danh bạ liên lạc</h1>
            <p className="text-muted-foreground">
              Thông tin liên lạc của các thành viên trong dòng họ
            </p>
          </div>
        </div>
      </div>

      <DirectoryFilters
        search={search}
        onSearchChange={setSearch}
        generationFilter={generationFilter}
        onGenerationFilterChange={setGenerationFilter}
        generations={generations}
        genderFilter={genderFilter}
        onGenderFilterChange={setGenderFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
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

        <DirectoryTable
          people={people}
          total={total}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          getContact={resolveContact}
        />

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
