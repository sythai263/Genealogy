/**
 * @project AncestorTree
 * @file src/components/people/people-list-view.tsx
 * @description People list with search and filter
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@components/ui';
import type { PeopleStatusFilter } from '@constants';
import { useFuzzySearch, usePeople, useStats } from '@hooks';
import { PeopleFilters } from './people-filters';
import { PersonCard } from './person-card';

export function PeopleListView() {
  const { isEditor } = useAuth();
  const { data: people, isLoading, error } = usePeople();
  const { data: stats } = useStats();

  const [search, setSearch] = useState('');
  const [generationFilter, setGenerationFilter] = useState('all');
  const [chiFilter, setChiFilter] = useState('all');
  const [statusFilter, setStatusFilter] =
    useState<PeopleStatusFilter>('all');

  const generations = useMemo(() => {
    if (!people) return [];
    return [...new Set(people.map((person) => person.generation))].sort(
      (a, b) => a - b
    );
  }, [people]);

  const chiValues = useMemo(() => {
    if (!people) return [];
    return [
      ...new Set(
        people
          .filter((person) => person.chi)
          .map((person) => person.chi as number)
      ),
    ].sort((a, b) => a - b);
  }, [people]);

  const fuzzyResults = useFuzzySearch(people, search);

  const filteredPeople = useMemo(() => {
    return fuzzyResults.filter((person) => {
      if (
        generationFilter !== 'all' &&
        person.generation !== parseInt(generationFilter)
      ) {
        return false;
      }
      if (chiFilter !== 'all' && person.chi !== parseInt(chiFilter)) {
        return false;
      }
      if (statusFilter === 'living' && !person.is_living) return false;
      if (statusFilter === 'deceased' && person.is_living) return false;
      return true;
    });
  }, [fuzzyResults, generationFilter, chiFilter, statusFilter]);

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

      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          {isLoading
            ? 'Đang tải...'
            : `Hiển thị ${filteredPeople.length} người`}
        </p>

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
        ) : filteredPeople.length === 0 ? (
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
            {filteredPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
