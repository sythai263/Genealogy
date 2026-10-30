/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-toolbar.tsx
 * @description Search, chi filter, zoom, orientation, and focus-root controls
 * @version 2.3.0
 * @updated 2026-08-09
 */

'use client';

import {
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@components/ui';
import { cn } from '@lib';
import type { Person, TreeOrientation } from '@types';
import {
    ArrowDownFromLine,
    ArrowRightFromLine,
    FileDown,
    Loader2,
    Maximize2,
    Minimize2,
    RotateCcw,
    Undo2,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FamilyTreeSearch } from './family-tree-search';
import { TreeLegendDialog } from './tree-legend-dialog';

interface FamilyTreeToolbarProps {
  filterSearch: string;
  onFilterSearchChange: (value: string) => void;
  filterDropdownOpen: boolean;
  onFilterDropdownOpenChange: (open: boolean) => void;
  debouncedSearch: string;
  searchResults: Person[] | undefined;
  isSearching: boolean;
  focusedIndex: number;
  onFocusedIndexChange: (index: number) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocusPerson: (person: Person) => void;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  chiValues: number[];
  chiFilter: string | null;
  onChiFilterChange: (value: string) => void;
  focusRootPerson: Person | null;
  onResetFocusRoot: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  /** Fullscreen toggle for the canvas wrapper. */
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onExpandAll: () => void;
  orientation: TreeOrientation;
  onOrientationChange: (orientation: TreeOrientation) => void;
  /** When provided, renders the "Export PDF" action (app variant only). */
  onExportPdf?: () => void;
  exportingPdf?: boolean;
  /** Tighter layout for public / mobile landing. */
  compact?: boolean;
}

export function FamilyTreeToolbar({
  filterSearch,
  onFilterSearchChange,
  filterDropdownOpen,
  onFilterDropdownOpenChange,
  debouncedSearch,
  searchResults,
  isSearching,
  focusedIndex,
  onFocusedIndexChange,
  onSearchKeyDown,
  onFocusPerson,
  searchContainerRef,
  chiValues,
  chiFilter,
  onChiFilterChange,
  focusRootPerson,
  onResetFocusRoot,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isFullscreen = false,
  onToggleFullscreen,
  onExpandAll,
  orientation,
  onOrientationChange,
  onExportPdf,
  exportingPdf = false,
  compact = false,
}: FamilyTreeToolbarProps) {
  const t = useTranslations('Tree');

  return (
    <div
      className={cn(
        'relative z-40 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-2 sm:gap-3',
        compact &&
          'rounded-none border-x-0 border-t-0 bg-background/95 backdrop-blur sm:rounded-lg sm:border'
      )}
    >
      <FamilyTreeSearch
        filterSearch={filterSearch}
        onFilterSearchChange={onFilterSearchChange}
        filterDropdownOpen={filterDropdownOpen}
        onFilterDropdownOpenChange={onFilterDropdownOpenChange}
        debouncedSearch={debouncedSearch}
        searchResults={searchResults}
        isSearching={isSearching}
        focusedIndex={focusedIndex}
        onFocusedIndexChange={onFocusedIndexChange}
        onSearchKeyDown={onSearchKeyDown}
        onFocusPerson={onFocusPerson}
        searchContainerRef={searchContainerRef}
        compact={compact}
      />

      <div className="flex flex-1 flex-wrap items-center gap-1.5 sm:flex-none sm:gap-2">
        {chiValues.length > 0 && chiFilter != null && (
          <Select value={chiFilter} onValueChange={onChiFilterChange}>
            <SelectTrigger className="h-8 w-20 bg-background shadow-sm text-xs sm:h-9 sm:w-32">
              <SelectValue placeholder={t('toolbar.selectChi')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('toolbar.allChi')}</SelectItem>
              {chiValues.map((chi) => (
                <SelectItem key={chi} value={String(chi)}>
                  {t('toolbar.chiN', { n: chi })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div
          className="flex items-center gap-0.5 rounded-lg border p-0.5 sm:p-1"
          role="group"
          aria-label={t('toolbar.orientation')}
        >
          <Button
            variant={orientation === 'horizontal' ? 'outline' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => onOrientationChange('horizontal')}
            aria-label={t('toolbar.horizontal')}
            aria-pressed={orientation === 'horizontal'}
            title={t('toolbar.horizontalTitle')}
          >
            <ArrowRightFromLine className="h-4 w-4" />
          </Button>
          <Button
            variant={orientation === 'vertical' ? 'outline' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => onOrientationChange('vertical')}
            aria-label={t('toolbar.vertical')}
            aria-pressed={orientation === 'vertical'}
            title={t('toolbar.verticalTitle')}
          >
            <ArrowDownFromLine className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-lg border p-1 sm:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onZoomOut}
            aria-label={t('actions.zoomOut')}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onZoomIn}
            aria-label={t('actions.zoomIn')}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onResetZoom}
            aria-label={t('actions.resetZoom')}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleFullscreen}
              aria-label={
                isFullscreen
                  ? t('actions.exitFullscreen')
                  : t('actions.fullscreen')
              }
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 px-0 shadow-sm sm:h-9 sm:w-auto sm:gap-1.5 sm:px-3"
          onClick={onExpandAll}
          aria-label={t('actions.expandAll')}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('actions.expandAll')}</span>
        </Button>

        <TreeLegendDialog />

        {onExportPdf && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 px-0 shadow-sm sm:h-9 sm:w-auto sm:gap-1.5 sm:px-3"
            onClick={onExportPdf}
            disabled={exportingPdf}
            aria-label={t('actions.exportPdf')}
          >
            {exportingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{t('actions.exportPdf')}</span>
          </Button>
        )}
      </div>

      {focusRootPerson && (
        <div className="flex w-full items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 sm:w-auto">
          <span className="min-w-0 flex-1 truncate text-sm font-medium sm:max-w-40 sm:flex-none">
            {t('toolbar.viewing', { name: focusRootPerson.display_name })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2 sm:h-7"
            onClick={onResetFocusRoot}
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>{t('actions.backToRoot')}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
