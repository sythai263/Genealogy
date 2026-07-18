/**
 * @project AncestorTree
 * @file src/components/directory/directory-view.tsx
 * @description Family directory with contacts, filters, search, privacy controls
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useMemo, useState } from 'react';
import { BookUser } from 'lucide-react';
import { useAuth } from '@components/auth';
import { usePeople } from '@hooks';
import type {
  DirectoryGenderFilter,
  DirectoryStatusFilter,
  Person,
} from '@types';
import { DirectoryFilters } from './directory-filters';
import { DirectoryTable } from './directory-table';
import {
  canSearchPersonContacts,
  getContactDisplay,
} from './get-contact-display';

export function DirectoryView() {
  const { data: people, isLoading } = usePeople();
  const { user, profile } = useAuth();
  const isAuthenticated = !!user;
  const isViewer = profile?.role === 'viewer';

  const [search, setSearch] = useState('');
  const [generationFilter, setGenerationFilter] = useState('all');
  const [genderFilter, setGenderFilter] =
    useState<DirectoryGenderFilter>('all');
  const [statusFilter, setStatusFilter] =
    useState<DirectoryStatusFilter>('all');

  const generations = useMemo(() => {
    if (!people) return [];
    return [...new Set(people.map((person) => person.generation))].sort(
      (a, b) => a - b
    );
  }, [people]);

  const filteredPeople = useMemo(() => {
    if (!people) return [];

    return people.filter((person) => {
      if (statusFilter === 'living' && !person.is_living) return false;
      if (statusFilter === 'deceased' && person.is_living) return false;

      if (search) {
        const query = search.toLowerCase();
        const matchName = person.display_name.toLowerCase().includes(query);
        const searchContacts = canSearchPersonContacts(
          person,
          isAuthenticated,
          !!isViewer,
          profile?.linked_person
        );
        const matchPhone =
          searchContacts && person.phone?.toLowerCase().includes(query);
        const matchEmail =
          searchContacts && person.email?.toLowerCase().includes(query);
        const matchAddress =
          searchContacts && person.address?.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchEmail && !matchAddress) {
          return false;
        }
      }

      if (
        generationFilter !== 'all' &&
        person.generation !== Number(generationFilter)
      ) {
        return false;
      }

      if (
        genderFilter !== 'all' &&
        person.gender !== Number(genderFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [
    people,
    search,
    generationFilter,
    genderFilter,
    statusFilter,
    isViewer,
    isAuthenticated,
    profile?.linked_person,
  ]);

  function resolveContact(person: Person) {
    return getContactDisplay({
      person,
      isAuthenticated,
      isViewer: !!isViewer,
      linkedPersonId: profile?.linked_person,
    });
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

      <DirectoryTable
        people={filteredPeople}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated}
        getContact={resolveContact}
      />
    </div>
  );
}
