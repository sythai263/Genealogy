/**
 * @project AncestorTree
 * @file src/components/tree/family-tree.tsx
 * @description Interactive family tree optimized with react-zoom-pan-pinch for 1000+ nodes
 * @version 2.2.0 - Library Zoom/Pan Integration
 */

'use client';

import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useTreeData } from '@/hooks/use-families';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  User,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Users,
  ArrowUpFromLine,
  ArrowDownFromLine,
  Search,
  X,
  GitBranch,
  FileDown,
  Loader2,
} from 'lucide-react';
import type { Person } from '@/types';
import { exportTreeToPdf, getExportWarning } from '@/lib/pdf-export';
import Link from 'next/link';
import { toast } from 'sonner';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { buildTreeLayout } from '@/lib/helper';

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

const NODE_WIDTH = 120;
const NODE_HEIGHT = 80;
const MINIMAP_WIDTH = 160;
const MINIMAP_HEIGHT = 100;

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

type ViewMode = 'all' | 'ancestors' | 'descendants';

interface TreeNodeData {
  person: Person;
  x: number;
  y: number;
  isCollapsed: boolean;
  hasChildren: boolean;
  isVisible: boolean;
}

interface TreeConnectionData {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'parent-child' | 'couple';
  isVisible: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Tree Node Component (Optimized)
// ═══════════════════════════════════════════════════════════════════════════

interface TreeNodeProps {
  node: TreeNodeData;
  onSelect: (person: Person) => void;
  onToggleCollapse: (personId: string) => void;
  isSelected: boolean;
}

const TreeNode = React.memo(({ node, onSelect, onToggleCollapse, isSelected }: TreeNodeProps) => {
  const { person, x, y, isCollapsed, hasChildren } = node;

  const initials = person.display_name
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const genderColor = person.gender === 1 ? 'border-blue-400' : 'border-pink-400';
  const selectedRing = isSelected ? 'ring-2 ring-primary ring-offset-2' : '';

  return (
    <g transform={`translate(${x}, ${y})`} style={{ transition: 'transform 0.3s ease-out' }}>
      <foreignObject width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div
          className={`h-full bg-card border-2 ${genderColor} ${selectedRing} rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all p-2 flex flex-col items-center justify-center relative`}
          onClick={() => onSelect(person)}
        >
          <Avatar className="h-8 w-8 mb-1 pointer-events-none">
            <AvatarImage src={person.avatar_url} />
            <AvatarFallback className="text-xs">{initials || <User className="h-3 w-3" />}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-center line-clamp-2 leading-tight pointer-events-none">
            {person.display_name}
          </span>
          {!person.is_living && <span className="text-[10px] text-muted-foreground pointer-events-none">†</span>}

          {hasChildren && (
            <button
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-background border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(person.id);
              }}
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
      </foreignObject>
    </g>
  );
});
TreeNode.displayName = 'TreeNode';

// ═══════════════════════════════════════════════════════════════════════════
// Tree Connection Component (Optimized)
// ═══════════════════════════════════════════════════════════════════════════

interface TreeConnectionProps {
  connection: TreeConnectionData;
}

const TreeConnection = React.memo(({ connection }: TreeConnectionProps) => {
  const { x1, y1, x2, y2, type } = connection;

  if (type === 'couple') {
    return (
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="currentColor" strokeWidth={2}
        className="text-pink-400"
        style={{ transition: 'all 0.3s ease-out' }}
      />
    );
  }

  const midY = y1 + (y2 - y1) / 2;
  return (
    <path
      d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
      fill="none" stroke="currentColor" strokeWidth={1.5}
      className="text-muted-foreground"
      style={{ transition: 'all 0.3s ease-out' }}
    />
  );
});
TreeConnection.displayName = 'TreeConnection';

// ═══════════════════════════════════════════════════════════════════════════
// Minimap Component
// ═══════════════════════════════════════════════════════════════════════════

interface MinimapProps {
  nodes: TreeNodeData[];
  viewBox: { x: number; y: number; width: number; height: number };
  treeWidth: number;
  treeHeight: number;
  onViewportClick: (x: number, y: number) => void;
}

const Minimap = React.memo(({ nodes, viewBox, treeWidth, treeHeight, onViewportClick }: MinimapProps) => {
  const scaleX = MINIMAP_WIDTH / treeWidth;
  const scaleY = MINIMAP_HEIGHT / treeHeight;
  const scale = Math.min(scaleX, scaleY) * 0.9;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    onViewportClick(x, y);
  };

  return (
    <div className="absolute bottom-4 right-4 bg-background/90 border rounded-lg p-2 shadow-lg z-50" data-html2canvas-ignore="true">
      <svg width={MINIMAP_WIDTH} height={MINIMAP_HEIGHT} className="cursor-pointer" onClick={handleClick}>
        <g transform={`scale(${scale})`}>
          {nodes.map((node) => (
            <circle
              key={node.person.id}
              cx={node.x + NODE_WIDTH / 2} cy={node.y + NODE_HEIGHT / 2}
              r={4 / scale}
              className={node.person.gender === 1 ? 'fill-blue-400' : 'fill-pink-400'}
            />
          ))}
          <rect
            x={viewBox.x} y={viewBox.y}
            width={viewBox.width} height={viewBox.height}
            fill="none" stroke="hsl(var(--primary))" strokeWidth={2 / scale}
            className="opacity-50"
          />
        </g>
      </svg>
    </div>
  );
});
Minimap.displayName = 'Minimap';

// ═══════════════════════════════════════════════════════════════════════════
// Main FamilyTreeV2 Component
// ═══════════════════════════════════════════════════════════════════════════

export function FamilyTreeV2() {
  const { data, isLoading, error } = useTreeData();

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showMinimap, setShowMinimap] = useState(true);
  const [filterRootId, setFilterRootId] = useState<string | null>(() => typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('root') : null);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const autoCollapseApplied = useRef(false);
  useEffect(() => {
    if (!data || autoCollapseApplied.current) return;
    if (data.people.length <= 50) return;
    autoCollapseApplied.current = true;

    const minGen = Math.min(...data.people.map(p => p.generation || 1));
    const collapseFromGen = minGen + 2;

    const fathersWithChildren = new Set<string>();
    for (const family of data.families) {
      if (family.father_id && data.children.some(c => c.family_id === family.id)) {
        fathersWithChildren.add(family.father_id);
      }
    }

    const toCollapse = new Set<string>();
    for (const person of data.people) {
      if (person.generation >= collapseFromGen && fathersWithChildren.has(person.id)) {
        toCollapse.add(person.id);
      }
    }

    if (toCollapse.size > 0) setCollapsedNodes(toCollapse);
  }, [data]);

  const handleSetFilterRoot = useCallback((person: Person | null) => {
    setFilterRootId(person?.id ?? null);
    setFilterSearch('');
    setFilterDropdownOpen(false);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (person) params.set('root', person.id);
      else params.delete('root');
      window.history.replaceState(null, '', params.toString() ? `?${params.toString()}` : window.location.pathname);
    }
  }, []);

  const filterRootPerson = filterRootId ? data?.people.find((p) => p.id === filterRootId) ?? null : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node;
      setContainerSize({ width: node.clientWidth, height: node.clientHeight });
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      });
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, []);

  const layout = useMemo(() => {
    if (!data || data.people.length === 0) return null;
    return buildTreeLayout(data, collapsedNodes, viewMode, selectedPerson?.id || null, filterRootId);
  }, [data, collapsedNodes, viewMode, selectedPerson?.id, filterRootId]);

  const handleExportPdf = useCallback(async () => {
    if (!containerRef.current || !layout) return;
    const warning = getExportWarning(layout.nodes.length);
    if (warning && layout.nodes.length > 100) { toast.warning(warning); return; }
    if (warning) toast.info(warning);
    setIsExportingPdf(true);
    try {
      await exportTreeToPdf(containerRef.current, { pageSize: layout.nodes.length > 30 ? 'a2' : 'a3' });
      toast.success('Xuất PDF thành công');
    } catch {
      toast.error('Lỗi khi xuất PDF');
    } finally {
      setIsExportingPdf(false);
    }
  }, [layout]);

  const handleToggleCollapse = useCallback((personId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => setCollapsedNodes(new Set()), []);
  const handleCollapseAll = useCallback(() => {
    if (!data) return;
    const minGen = Math.min(...data.people.map(p => p.generation || 1));
    const fathersWithChildren = new Set<string>();
    for (const family of data.families) {
      if (family.father_id && data.children.some(c => c.family_id === family.id)) fathersWithChildren.add(family.father_id);
    }
    const toCollapse = new Set<string>();
    for (const person of data.people) {
      if (person.generation > minGen && fathersWithChildren.has(person.id)) toCollapse.add(person.id);
    }
    setCollapsedNodes(toCollapse);
  }, [data]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode !== 'all' && !selectedPerson && data?.people.length) setSelectedPerson(data.people[0]);
  };

  if (isLoading) return <div className="flex items-center justify-center h-[60vh]"><Skeleton className="h-64 w-96" /></div>;
  if (error) return <Card className="border-destructive"><CardContent className="py-12 text-center text-destructive">Lỗi: {error.message}</CardContent></Card>;
  if (!layout || layout.nodes.length === 0) return <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Chưa có dữ liệu</p></CardContent></Card>;

  return (
    <div className="space-y-4">
      {/* Filters UI */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-lg border border-dashed">
        <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium shrink-0">Xem nhánh từ:</span>
        {filterRootPerson ? (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-md px-3 py-1">
            <span className="text-sm font-medium">{filterRootPerson.display_name}</span>
            <button onClick={() => handleSetFilterRoot(null)} className="ml-1 text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <div className="relative z-50">
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <input type="text" placeholder="Tìm thành viên..." value={filterSearch} onChange={(e) => { setFilterSearch(e.target.value); setFilterDropdownOpen(e.target.value.length >= 2); }} onFocus={() => filterSearch.length >= 2 && setFilterDropdownOpen(true)} onBlur={() => setTimeout(() => setFilterDropdownOpen(false), 200)} className="pl-8 pr-3 py-1 text-sm border rounded-md bg-background w-48 focus:outline-none focus:ring-1 focus:ring-primary" />
            {filterDropdownOpen && data?.people && (
              <div className="absolute z-50 top-full mt-1 bg-background border rounded-md shadow-lg w-64 max-h-48 overflow-y-auto">
                {data.people.filter((p) => filterSearch.length >= 2 && p.display_name.toLowerCase().includes(filterSearch.toLowerCase())).slice(0, 10).map((person) => (
                    <button key={person.id} onMouseDown={() => handleSetFilterRoot(person)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors">
                      <p className="text-xs font-medium">{person.display_name}</p>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <TransformWrapper
        initialScale={typeof window !== 'undefined' && window.innerWidth < 768 ? 0.7 : 1}
        minScale={0.1}
        maxScale={3}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform, setTransform, instance: {transformState: state} }) => (
          <>
            {/* Toolbar Area */}
            <div className="flex flex-wrap items-center gap-2 relative z-40">
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomOut()}><ZoomOut className="h-4 w-4" /></Button>
                <span className="text-sm w-12 text-center">{Math.round(state.scale * 100)}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomIn()}><ZoomIn className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resetTransform()}><RotateCcw className="h-4 w-4" /></Button>
              </div>
              
              <Select value={viewMode} onValueChange={(v) => handleViewModeChange(v as ViewMode)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"><span className="flex items-center gap-2"><Users className="h-4 w-4" />Tất cả</span></SelectItem>
                  <SelectItem value="ancestors"><span className="flex items-center gap-2"><ArrowUpFromLine className="h-4 w-4" />Tổ tiên</span></SelectItem>
                  <SelectItem value="descendants"><span className="flex items-center gap-2"><ArrowDownFromLine className="h-4 w-4" />Con cháu</span></SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleExpandAll}>Mở rộng</Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleCollapseAll}>Thu gọn</Button>
              </div>
              
              <Button variant={showMinimap ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowMinimap(!showMinimap)} className="hidden md:flex">
                <Maximize2 className="h-4 w-4 mr-2" />Minimap
              </Button>

              <Button variant="ghost" size="sm" onClick={handleExportPdf} disabled={isExportingPdf || !layout} className="hidden md:flex">
                {isExportingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
                PDF
              </Button>
            </div>

            {/* Tree Area */}
            <div ref={containerCallbackRef} className="border rounded-lg bg-muted/30 overflow-hidden relative cursor-grab active:cursor-grabbing">
              <TransformComponent wrapperStyle={{ width: '100%', height: '60vh' }}>
                <svg width={layout.width} height={layout.height} style={{ minWidth: '100%', minHeight: '100%' }}>
                  <g transform={`translate(${layout.offsetX}, 0)`}>
                    {layout.connections.map((conn) => (
                      <TreeConnection key={conn.id} connection={conn} />
                    ))}
                    {layout.nodes.map((node) => (
                      <TreeNode
                        key={node.person.id} node={node}
                        onSelect={setSelectedPerson} onToggleCollapse={handleToggleCollapse}
                        isSelected={selectedPerson?.id === node.person.id}
                      />
                    ))}
                  </g>
                </svg>
              </TransformComponent>

              {showMinimap && layout.nodes.length > 3 && (
                <Minimap
                  nodes={layout.nodes}
                  viewBox={{
                    x: -state.positionX / state.scale,
                    y: -state.positionY / state.scale,
                    width: containerSize.width / state.scale,
                    height: containerSize.height / state.scale,
                  }}
                  treeWidth={layout.width} treeHeight={layout.height}
                  onViewportClick={(x, y) => {
                    setTransform(
                      -(x * state.scale - containerSize.width / 2),
                      -(y * state.scale - containerSize.height / 2),
                      state.scale
                    );
                  }}
                />
              )}
            </div>
          </>
        )}
      </TransformWrapper>

      {/* Selected Person Card (kept from original) */}
      {selectedPerson && (
        <Card className="animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedPerson.avatar_url} />
                <AvatarFallback>{selectedPerson.display_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedPerson.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Đời {selectedPerson.generation}
                  {selectedPerson.chi && ` • Chi ${selectedPerson.chi}`}
                  {!selectedPerson.is_living && ' • Đã mất'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm">
                <Link href={`/people/${selectedPerson.id}`}>Xem chi tiết</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}