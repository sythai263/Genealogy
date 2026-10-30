/**
 * @project AncestorTree
 * @file src/components/tree/family-tree.tsx
 * @description Interactive family tree orchestrator (horizontal / vertical) —
 *              composes toolbar, canvas and selected-person card; search,
 *              zoom and PDF-export machinery live in tree hooks
 * @version 6.0.0
 * @updated 2026-10-29
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ZoomBehavior } from 'd3';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@components/ui';
import { TREE_ROOT_QUERY_PARAM } from '@constants';
import {
  useIsMobile,
  useTreeData,
  useTreePdfExport,
  useTreePersonSearch,
  useTreeZoom,
} from '@hooks';
import {
  buildPersonHierarchy,
  cn,
  expandAllNodes,
} from '@lib';
import type {
  Person,
  TreeOrientation,
  TreeSvgDatum,
} from '@types';
import { FamilyTreeCanvas } from './family-tree-canvas';
import { FamilyTreeSelectedCard } from './family-tree-selected-card';
import { FamilyTreeToolbar } from './family-tree-toolbar';

interface FamilyTreeProps {
  /**
   * `app` — authenticated tree page (default).
   * `public` — landing page: compact toolbar, full-height canvas, no people detail link.
   */
  variant?: 'app' | 'public';
  className?: string;
}

function getDefaultOrientation(isMobile: boolean): TreeOrientation {
  return isMobile ? 'vertical' : 'horizontal';
}

export function FamilyTree({
  variant = 'app',
  className,
}: FamilyTreeProps) {
  const tCommon = useTranslations('Common');
  const isPublic = variant === 'public';
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useTreeData();

  const focusRootId = searchParams.get(TREE_ROOT_QUERY_PARAM);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [chiFilter, setChiFilter] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [orientationOverride, setOrientationOverride] =
    useState<TreeOrientation>('vertical');

  const defaultChiApplied = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<
    SVGSVGElement,
    TreeSvgDatum
  > | null>(null);

  const orientation =
    orientationOverride ?? getDefaultOrientation(isMobile);

  const setFocusRootId = useCallback(
    (personId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (personId) {
        params.set(TREE_ROOT_QUERY_PARAM, personId);
      } else {
        params.delete(TREE_ROOT_QUERY_PARAM);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

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
    setChiFilter('all');
  }, [data]);

  // Drop invalid ?root= once tree data is available
  useEffect(() => {
    if (!data || !focusRootId) return;
    const exists = data.people.some((person) => person.id === focusRootId);
    if (!exists) {
      setFocusRootId(null);
    }
  }, [data, focusRootId, setFocusRootId]);

  const filterChi =
    chiFilter == null || chiFilter === 'all' ? null : Number(chiFilter);

  const hierarchyRoot = useMemo(() => {
    if (!data || data.people.length === 0 || chiFilter == null) return null;
    return buildPersonHierarchy(data, {
      filterChi: Number.isFinite(filterChi) ? filterChi : null,
      focusRootId,
    });
  }, [data, filterChi, focusRootId, chiFilter]);

  const [prevHierarchyRoot, setPrevHierarchyRoot] = useState(hierarchyRoot);
  if (prevHierarchyRoot !== hierarchyRoot) {
    setPrevHierarchyRoot(hierarchyRoot);
    setLayoutVersion((v) => v + 1);
  }

  const focusRootPerson = useMemo(() => {
    if (!focusRootId || !data) return null;
    return data.people.find((p) => p.id === focusRootId) ?? null;
  }, [focusRootId, data]);

  const bumpLayout = useCallback(() => {
    setLayoutVersion((v) => v + 1);
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!hierarchyRoot) return;
    expandAllNodes(hierarchyRoot);
    bumpLayout();
  }, [hierarchyRoot, bumpLayout]);

  function handleFocusPerson(person: Person) {
    setFocusRootId(person.id);
    setSelectedPerson(person);
    search.resetSearch();
  }

  const search = useTreePersonSearch({
    isPublic,
    people: data?.people,
    onFocusPerson: handleFocusPerson,
  });

  const { handleZoomIn, handleZoomOut, handleResetZoom } = useTreeZoom({
    svgRef,
    zoomBehaviorRef,
  });

  const { isExportingPdf, handleExportPdf } = useTreePdfExport({
    svgRef,
    wrapperRef,
  });

  const handleResetFocusRoot = useCallback(() => {
    setFocusRootId(null);
  }, [setFocusRootId]);

  const handleOrientationChange = useCallback((next: TreeOrientation) => {
    setOrientationOverride(next);
  }, []);

  function handleChiFilterChange(value: string) {
    setChiFilter(value);
    setFocusRootId(null);
    setSelectedPerson(null);
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-destructive',
          isPublic ? 'h-full min-h-[50vh]' : 'h-[85vh]'
        )}
      >
        <AlertCircle className="mb-2 h-10 w-10 opacity-80" />
        <h3 className="text-lg font-semibold">{tCommon('errorTitle')}</h3>
        <p className="text-sm opacity-80">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          isPublic ? 'h-full min-h-[50vh]' : 'h-[85vh]'
        )}
      >
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full',
        isPublic ? 'flex h-full min-h-0 flex-col' : 'space-y-4',
        className
      )}
    >
      <FamilyTreeToolbar
        filterSearch={search.filterSearch}
        onFilterSearchChange={search.setFilterSearch}
        filterDropdownOpen={search.filterDropdownOpen}
        onFilterDropdownOpenChange={search.setFilterDropdownOpen}
        debouncedSearch={search.debouncedSearch}
        searchResults={search.searchResults}
        isSearching={search.isSearching}
        focusedIndex={search.focusedIndex}
        onFocusedIndexChange={search.setFocusedIndex}
        onSearchKeyDown={search.handleSearchKeyDown}
        onFocusPerson={handleFocusPerson}
        searchContainerRef={search.searchContainerRef}
        chiValues={chiValues}
        chiFilter={chiFilter}
        onChiFilterChange={handleChiFilterChange}
        focusRootPerson={focusRootPerson}
        onResetFocusRoot={handleResetFocusRoot}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onExpandAll={handleExpandAll}
        orientation={orientation}
        onOrientationChange={handleOrientationChange}
        onExportPdf={isPublic ? undefined : handleExportPdf}
        exportingPdf={isExportingPdf}
        compact={isPublic}
      />

      <FamilyTreeCanvas
        hierarchyRoot={hierarchyRoot}
        layoutVersion={layoutVersion}
        orientation={orientation}
        selectedPersonId={selectedPerson?.id ?? null}
        onSelectPerson={setSelectedPerson}
        onHierarchyMutated={bumpLayout}
        zoomBehaviorRef={zoomBehaviorRef}
        wrapperRef={wrapperRef}
        svgRef={svgRef}
        compactHint={isPublic || orientation === 'vertical'}
        isPublic={isPublic}
        className={
          isPublic
            ? 'h-full min-h-0 flex-1 rounded-none border-x-0 border-b-0 sm:rounded-xl sm:border'
            : undefined
        }
      />

      {selectedPerson && (
        <FamilyTreeSelectedCard
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          showDetailLink={!isPublic}
        />
      )}
    </div>
  );
}
