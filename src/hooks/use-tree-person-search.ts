/**
 * @project AncestorTree
 * @file src/hooks/use-tree-person-search.ts
 * @description Person-search state machinery for the family tree toolbar —
 *              debounced query, dropdown open/close, keyboard navigation,
 *              click-outside, and result list (remote in app variant,
 *              client-side over loaded people in public variant)
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TREE_SEARCH_DEBOUNCE_MS } from '@constants';
import type { Person } from '@types';
import { useSearchPeopleAdvanced } from './use-people';

interface UseTreePersonSearchParams {
  /** Public variant searches locally over already-loaded people */
  isPublic: boolean;
  people: Person[] | undefined;
  /** Called when the user commits a search result (Enter / click) */
  onFocusPerson: (person: Person) => void;
}

export function useTreePersonSearch({
  isPublic,
  people,
  onFocusPerson,
}: UseTreePersonSearchParams) {
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filterSearch);
      setFocusedIndex(-1);
    }, TREE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filterSearch]);

  // Hook already debounces; pass raw input so we do not wait 600ms total.
  const { data: remoteSearchResults, isFetching: isRemoteSearching } =
    useSearchPeopleAdvanced(isPublic ? '' : filterSearch);

  const searchResults = useMemo(() => {
    if (!isPublic) return remoteSearchResults;
    const query = debouncedSearch.trim().toLowerCase();
    if (query.length < 2 || !people) return [];
    return people
      .filter((person) =>
        person.display_name.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [isPublic, remoteSearchResults, debouncedSearch, people]);

  const isSearching = isPublic ? false : isRemoteSearching;

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (!filterDropdownOpen || !searchResults || searchResults.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
        onFocusPerson(searchResults[focusedIndex]);
      }
    } else if (event.key === 'Escape') {
      setFilterDropdownOpen(false);
    }
  }

  function resetSearch() {
    setFilterDropdownOpen(false);
    setFilterSearch('');
  }

  return {
    filterSearch,
    setFilterSearch,
    filterDropdownOpen,
    setFilterDropdownOpen,
    debouncedSearch,
    searchResults,
    isSearching,
    focusedIndex,
    setFocusedIndex,
    handleSearchKeyDown,
    searchContainerRef,
    resetSearch,
  };
}
