/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-canvas.tsx
 * @description Tree canvas wrapper — owns the svg/wrapper elements and hint
 *              overlay; the D3 render pass lives in useTreeRender
 * @version 3.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@lib';
import type {
  HierarchyPersonNode,
  Person,
  TreeOrientation,
  TreeSvgDatum,
} from '@types';
import type { ZoomBehavior } from 'd3';
import { useTreeRender } from '@hooks';

interface FamilyTreeCanvasProps {
  hierarchyRoot: HierarchyPersonNode | null;
  layoutVersion: number;
  orientation: TreeOrientation;
  selectedPersonId: string | null;
  onSelectPerson: (person: Person) => void;
  onHierarchyMutated: () => void;
  zoomBehaviorRef: React.MutableRefObject<ZoomBehavior<
    SVGSVGElement,
    TreeSvgDatum
  > | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  /** Override wrapper height / border (e.g. public full-bleed layout). */
  className?: string;
  /** Shorter mobile hint text. */
  compactHint?: boolean;
}

export function FamilyTreeCanvas({
  hierarchyRoot,
  layoutVersion,
  orientation,
  selectedPersonId,
  onSelectPerson,
  onHierarchyMutated,
  zoomBehaviorRef,
  wrapperRef,
  svgRef,
  className,
  compactHint = false,
}: FamilyTreeCanvasProps) {
  const t = useTranslations('Tree');

  useTreeRender({
    hierarchyRoot,
    layoutVersion,
    orientation,
    selectedPersonId,
    onSelectPerson,
    onHierarchyMutated,
    zoomBehaviorRef,
    wrapperRef,
    svgRef,
  });

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'relative h-[85vh] w-full overflow-hidden rounded-xl border bg-muted/30 shadow-inner touch-none',
        className
      )}
    >
      <svg
        ref={svgRef}
        className="h-full w-full touch-none cursor-grab outline-none active:cursor-grabbing"
      />
      <div
        className={cn(
          'pointer-events-none absolute bottom-3 left-3 select-none text-[11px] font-medium text-muted-foreground opacity-60 sm:bottom-4 sm:left-4 sm:text-xs sm:opacity-50',
          compactHint && 'max-w-[70%] leading-snug'
        )}
      >
        {compactHint
          ? t('canvas.hintCompact')
          : t('canvas.hintFull')}
      </div>
    </div>
  );
}
