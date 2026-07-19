/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-v3.tsx
 * @description Interactive horizontal family tree orchestrator
 * @version 5.0.0
 * @updated 2026-07-19
 */

'use client';

import * as d3 from 'd3';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Skeleton } from '@components/ui';
import {
  TREE_SEARCH_DEBOUNCE_MS,
  TREE_ZOOM_IN_FACTOR,
  TREE_ZOOM_OUT_FACTOR,
} from '@constants';
import { useSearchPeopleAdvanced, useTreeData } from '@hooks';
import {
  buildPersonHierarchy,
  expandAllNodes,
} from '@lib';
import type { HierarchyPersonNode, Person, TreeSvgDatum } from '@types';
import { FamilyTreeCanvas } from './family-tree-canvas';
import { FamilyTreeSelectedCard } from './family-tree-selected-card';
import { FamilyTreeToolbar } from './family-tree-toolbar';

export function FamilyTreeV3() {
  const { data, isLoading, error } = useTreeData();

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [chiFilter, setChiFilter] = useState<string | null>(null);
  const [focusRootId, setFocusRootId] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);

  const [filterSearch, setFilterSearch] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const defaultChiApplied = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    TreeSvgDatum
  > | null>(null);
  const hierarchyRef = useRef<HierarchyPersonNode | null>(null);

  const chiValues = useMemo(() => {
    if (!data) return [] as number[];
    const values = new Set<number>();
    for (const person of data.people) {
      if (person.chi != null) values.add(person.chi);
    }
    return [...values].sort((a, b) => a - b);
  }, [data]);

  useEffect(() => {
    if (defaultChiApplied.current || !data) return;
    defaultChiApplied.current = true;
    setChiFilter(chiValues.length > 0 ? String(chiValues[0]) : 'all');
  }, [data, chiValues]);

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

  const { data: searchResults, isFetching: isSearching } =
    useSearchPeopleAdvanced(debouncedSearch);

  const filterChi =
    chiFilter == null || chiFilter === 'all' ? null : Number(chiFilter);

  const hierarchyRoot = useMemo(() => {
    if (!data || data.people.length === 0 || chiFilter == null) return null;
    return buildPersonHierarchy(data, {
      filterChi: Number.isFinite(filterChi) ? filterChi : null,
      focusRootId,
    });
  }, [data, filterChi, focusRootId, chiFilter]);

  useEffect(() => {
    hierarchyRef.current = hierarchyRoot;
    setLayoutVersion((v) => v + 1);
  }, [hierarchyRoot]);

  const focusRootPerson = useMemo(() => {
    if (!focusRootId || !data) return null;
    return data.people.find((p) => p.id === focusRootId) ?? null;
  }, [focusRootId, data]);

  const bumpLayout = useCallback(() => {
    setLayoutVersion((v) => v + 1);
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!hierarchyRef.current) return;
    expandAllNodes(hierarchyRef.current);
    bumpLayout();
  }, [bumpLayout]);

  const handleFocusPerson = useCallback((person: Person) => {
    setFocusRootId(person.id);
    setSelectedPerson(person);
    setFilterDropdownOpen(false);
    setFilterSearch('');
  }, []);

  const handleResetFocusRoot = useCallback(() => {
    setFocusRootId(null);
  }, []);

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
        handleFocusPerson(searchResults[focusedIndex]);
      }
    } else if (event.key === 'Escape') {
      setFilterDropdownOpen(false);
    }
  }

  function handleZoomIn() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleBy, TREE_ZOOM_IN_FACTOR);
  }

  function handleZoomOut() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleBy, TREE_ZOOM_OUT_FACTOR);
  }

  function handleResetZoom() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleTo, 1);
  }

  function handleChiFilterChange(value: string) {
    setChiFilter(value);
    setFocusRootId(null);
    setSelectedPerson(null);
  }

  if (error) {
    return (
      <div className="flex h-[85vh] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-destructive">
        <AlertCircle className="mb-2 h-10 w-10 opacity-80" />
        <h3 className="text-lg font-semibold">Đã có lỗi xảy ra</h3>
        <p className="text-sm opacity-80">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[85vh] items-center justify-center">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <FamilyTreeToolbar
        filterSearch={filterSearch}
        onFilterSearchChange={setFilterSearch}
        filterDropdownOpen={filterDropdownOpen}
        onFilterDropdownOpenChange={setFilterDropdownOpen}
        debouncedSearch={debouncedSearch}
        searchResults={searchResults}
        isSearching={isSearching}
        focusedIndex={focusedIndex}
        onFocusedIndexChange={setFocusedIndex}
        onSearchKeyDown={handleSearchKeyDown}
        onFocusPerson={handleFocusPerson}
        searchContainerRef={searchContainerRef}
        chiValues={chiValues}
        chiFilter={chiFilter}
        onChiFilterChange={handleChiFilterChange}
        focusRootPerson={focusRootPerson}
        onResetFocusRoot={handleResetFocusRoot}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onExpandAll={handleExpandAll}
      />

      <FamilyTreeCanvas
        hierarchyRoot={hierarchyRoot}
        layoutVersion={layoutVersion}
        selectedPersonId={selectedPerson?.id ?? null}
        onSelectPerson={setSelectedPerson}
        onHierarchyMutated={bumpLayout}
        zoomBehaviorRef={zoomBehaviorRef}
        wrapperRef={wrapperRef}
        svgRef={svgRef}
      />

      {selectedPerson && (
        <FamilyTreeSelectedCard
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}
