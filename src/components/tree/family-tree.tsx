/**
 * @project AncestorTree
 * @file src/components/tree/family-tree.tsx
 * @description Interactive family tree orchestrator (horizontal / vertical)
 * @version 5.4.0
 * @updated 2026-08-09
 */

'use client';

import { Skeleton } from '@components/ui';
import {
    TREE_ROOT_QUERY_PARAM,
    TREE_SEARCH_DEBOUNCE_MS,
    TREE_ZOOM_IN_FACTOR,
    TREE_ZOOM_OUT_FACTOR,
} from '@constants';
import { useIsMobile, useSearchPeopleAdvanced, useTreeData } from '@hooks';
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
import { select, type ZoomBehavior } from 'd3';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
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
  const tTree = useTranslations('Tree');
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

  const [filterSearch, setFilterSearch] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
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
    if (query.length < 2 || !data?.people) return [];
    return data.people
      .filter((person) =>
        person.display_name.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [isPublic, remoteSearchResults, debouncedSearch, data]);

  const isSearching = isPublic ? false : isRemoteSearching;

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

  const handleFocusPerson = useCallback(
    (person: Person) => {
      setFocusRootId(person.id);
      setSelectedPerson(person);
      setFilterDropdownOpen(false);
      setFilterSearch('');
    },
    [setFocusRootId]
  );

  const handleResetFocusRoot = useCallback(() => {
    setFocusRootId(null);
  }, [setFocusRootId]);

  const handleOrientationChange = useCallback((next: TreeOrientation) => {
    setOrientationOverride(next);
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
    select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleBy, TREE_ZOOM_IN_FACTOR);
  }

  function handleZoomOut() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleBy, TREE_ZOOM_OUT_FACTOR);
  }

  function handleResetZoom() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleTo, 1);
  }

  function handleChiFilterChange(value: string) {
    setChiFilter(value);
    setFocusRootId(null);
    setSelectedPerson(null);
  }

  /**
   * Exports the rendered tree SVG to PDF. The content bounding box is measured
   * off `g.main-container` (zoom transform lives on that <g>, so getBBox()
   * returns pre-zoom local coordinates) and passed as offsets so the export
   * captures the full tree regardless of the current pan/zoom.
   */
  async function handleExportPdf() {
    const container = wrapperRef.current;
    const mainG = svgRef.current?.querySelector('g.main-container');
    if (!container || !mainG || !(mainG instanceof SVGGElement)) {
      toast.error(tTree('export.error'));
      return;
    }

    setIsExportingPdf(true);
    try {
      const bbox = mainG.getBBox();
      const { exportTreeToPdf } = await import('@lib/pdf-export');
      await exportTreeToPdf(
        container,
        Math.max(bbox.width, 1),
        Math.max(bbox.height, 1),
        -bbox.x,
        -bbox.y
      );
      toast.success(tTree('export.success'));
    } catch {
      toast.error(tTree('export.error'));
    } finally {
      setIsExportingPdf(false);
    }
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
