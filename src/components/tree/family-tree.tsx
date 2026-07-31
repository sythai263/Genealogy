/**
 * @project AncestorTree
 * @file src/components/tree/family-tree.tsx
 * @description Interactive family tree with zoom, pan, collapse/expand, filters, minimap
 * @version 2.1.0
 * @updated 2026-07-17
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownFromLine,
  ArrowUpFromLine,
  ChevronDown,
  ChevronRight,
  FileDown,
  GitBranch,
  Loader2,
  Maximize2,
  Move,
  RotateCcw,
  Search,
  User,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
  type WheelEvent,
} from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, CardContent, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from '@components/ui';
import {
  BRANCH_GAP,
  COUPLE_GAP,
  LEVEL_HEIGHT,
  MINIMAP_HEIGHT,
  MINIMAP_WIDTH,
  NODE_HEIGHT,
  NODE_WIDTH,
  SIBLING_GAP,
} from '@constants';
import { useTreeData } from '@hooks';
import { getExportWarning, type TreeData, cn } from '@lib';
import type { Person } from '@types';

type ViewMode = "all" | "ancestors" | "descendants";

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
  type: "parent-child" | "couple";
  isVisible: boolean;
}

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TreeLayout {
  nodes: TreeNodeData[];
  connections: TreeConnectionData[];
  width: number;
  height: number;
  offsetX: number;
}

function getGenderBorderClass(gender: number): string {
  return gender === 1 ? "border-primary" : "border-secondary-foreground/40";
}

function getGenderAvatarClass(gender: number): string {
  return gender === 1
    ? "bg-primary/10 text-primary"
    : "bg-secondary text-secondary-foreground";
}

function getGenderFillClass(gender: number): string {
  return gender === 1 ? "fill-primary" : "fill-secondary-foreground";
}

function getPersonInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((part) => part[0])
    .slice(-2)
    .join("")
    .toUpperCase();
}

interface TreeNodeProps {
  node: TreeNodeData;
  onSelect: (person: Person) => void;
  onToggleCollapse: (personId: string) => void;
  isSelected: boolean;
}

function TreeNode({
  node,
  onSelect,
  onToggleCollapse,
  isSelected,
}: TreeNodeProps) {
  const { person, x, y, isCollapsed, hasChildren } = node;
  const initials = getPersonInitials(person.display_name);

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <foreignObject x={x} y={y} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div
          className={cn(
            "relative flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 bg-card p-2 shadow-sm transition-all hover:shadow-md",
            getGenderBorderClass(person.gender),
            isSelected && "ring-2 ring-primary ring-offset-2",
          )}
          onClick={() => onSelect(person)}
        >
          <Avatar className="mb-1 size-8">
            <AvatarImage src={person.avatar_url} />
            <AvatarFallback className="text-xs">
              {initials || <User className="size-3" />}
            </AvatarFallback>
          </Avatar>
          <span className="line-clamp-2 text-center text-xs leading-tight font-medium text-foreground">
            {person.display_name}
          </span>
          {!person.is_living && (
            <span className="text-[10px] text-muted-foreground">†</span>
          )}

          {hasChildren && (
            <button
              type="button"
              className={cn(
                "absolute -bottom-3 left-1/2 z-10 flex size-6 -translate-x-1/2 items-center justify-center",
                "rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onToggleCollapse(person.id);
              }}
              aria-label={isCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isCollapsed ? (
                <ChevronRight className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>
          )}
        </div>
      </foreignObject>
    </motion.g>
  );
}

interface TreeConnectionProps {
  connection: TreeConnectionData;
}

function TreeConnection({ connection }: TreeConnectionProps) {
  const { x1, y1, x2, y2, type } = connection;

  if (type === "couple") {
    return (
      <motion.line
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth={2}
        className="text-primary"
      />
    );
  }

  const midY = y1 + (y2 - y1) / 2;

  return (
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5 }}
      d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="text-muted-foreground"
    />
  );
}

interface MinimapProps {
  nodes: TreeNodeData[];
  viewBox: ViewBox;
  treeWidth: number;
  treeHeight: number;
  onViewportClick: (x: number, y: number) => void;
}

function Minimap({
  nodes,
  viewBox,
  treeWidth,
  treeHeight,
  onViewportClick,
}: MinimapProps) {
  const scaleX = MINIMAP_WIDTH / treeWidth;
  const scaleY = MINIMAP_HEIGHT / treeHeight;
  const scale = Math.min(scaleX, scaleY) * 0.9;
  const visibleNodes = nodes.filter((node) => node.isVisible);

  function handleClick(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    onViewportClick(x, y);
  }

  return (
    <div
      className="absolute right-4 bottom-4 rounded-lg border border-border bg-background/90 p-2 shadow-lg"
      data-html2canvas-ignore="true"
    >
      <svg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="cursor-pointer"
        onClick={handleClick}
      >
        <g transform={`scale(${scale})`}>
          {visibleNodes.map((node) => (
            <circle
              key={node.person.id}
              cx={node.x + NODE_WIDTH / 2}
              cy={node.y + NODE_HEIGHT / 2}
              r={4 / scale}
              className={getGenderFillClass(node.person.gender)}
            />
          ))}

          <rect
            x={viewBox.x}
            y={viewBox.y}
            width={viewBox.width}
            height={viewBox.height}
            fill="none"
            stroke="currentColor"
            strokeWidth={2 / scale}
            className="text-primary opacity-50"
          />
        </g>
      </svg>
    </div>
  );
}

function buildTreeLayout(
  data: TreeData,
  collapsedNodes: Set<string>,
  viewMode: ViewMode,
  focusPersonId: string | null,
  filterRootId: string | null = null,
): TreeLayout {
  const { people, families, children } = data;

  const fatherToFamilies = new Map<string, typeof families>();
  const motherToFamilies = new Map<string, typeof families>();
  const childToFamily = new Map<string, (typeof families)[0]>();

  for (const family of families) {
    if (family.father_id) {
      if (!fatherToFamilies.has(family.father_id)) {
        fatherToFamilies.set(family.father_id, []);
      }
      fatherToFamilies.get(family.father_id)!.push(family);
    }
    if (family.mother_id) {
      if (!motherToFamilies.has(family.mother_id)) {
        motherToFamilies.set(family.mother_id, []);
      }
      motherToFamilies.get(family.mother_id)!.push(family);
    }
  }

  for (const child of children) {
    if (!childToFamily.has(child.person_id)) {
      const family = families.find((item) => item.id === child.family_id);
      if (family) {
        childToFamily.set(child.person_id, family);
      }
    }
  }

  function getVisiblePeopleIds(): Set<string> {
    const visible = new Set<string>();

    if (filterRootId) {
      function addWithDescendants(personId: string) {
        if (visible.has(personId)) return;
        visible.add(personId);
        const personFamilies = [
          ...(fatherToFamilies.get(personId) || []),
          ...(motherToFamilies.get(personId) || []),
        ];
        for (const family of personFamilies) {
          if (family.father_id && family.father_id !== personId) {
            visible.add(family.father_id);
          }
          if (family.mother_id && family.mother_id !== personId) {
            visible.add(family.mother_id);
          }
          children
            .filter((child) => child.family_id === family.id)
            .forEach((child) => addWithDescendants(child.person_id));
        }
      }
      addWithDescendants(filterRootId);
      return visible;
    }

    if (viewMode === "all") {
      people.forEach((person) => visible.add(person.id));

      function hideDescendants(personId: string) {
        const personFamilies = fatherToFamilies.get(personId) || [];
        for (const family of personFamilies) {
          children
            .filter((child) => child.family_id === family.id)
            .forEach((child) => {
              visible.delete(child.person_id);
              hideDescendants(child.person_id);
            });
        }
      }

      collapsedNodes.forEach((nodeId) => hideDescendants(nodeId));
    } else if (viewMode === "ancestors" && focusPersonId) {
      function addAncestors(personId: string) {
        visible.add(personId);
        const family = childToFamily.get(personId);
        if (family?.father_id) addAncestors(family.father_id);
        if (family?.mother_id) addAncestors(family.mother_id);
      }
      addAncestors(focusPersonId);
    } else if (viewMode === "descendants" && focusPersonId) {
      function addDescendants(personId: string) {
        if (visible.has(personId)) return;
        visible.add(personId);
        const personFamilies = [
          ...(fatherToFamilies.get(personId) || []),
          ...(motherToFamilies.get(personId) || []),
        ];
        for (const family of personFamilies) {
          if (family.father_id && family.father_id !== personId) {
            visible.add(family.father_id);
          }
          if (family.mother_id && family.mother_id !== personId) {
            visible.add(family.mother_id);
          }
          children
            .filter((child) => child.family_id === family.id)
            .forEach((child) => addDescendants(child.person_id));
        }
      }
      addDescendants(focusPersonId);
    } else {
      people.forEach((person) => visible.add(person.id));
    }

    return visible;
  }

  const visibleIds = getVisiblePeopleIds();
  const visiblePeople = people.filter((person) => visibleIds.has(person.id));

  if (visiblePeople.length === 0) {
    return { nodes: [], connections: [], width: 0, height: 0, offsetX: 0 };
  }

  const positionedAsWife = new Set<string>();
  for (const person of visiblePeople) {
    if (person.gender === 2) {
      const personFamilies = motherToFamilies.get(person.id) || [];
      if (
        personFamilies.some(
          (family) => family.father_id && visibleIds.has(family.father_id),
        )
      ) {
        positionedAsWife.add(person.id);
      }
    }
  }

  function getVisibleChildrenAsFather(personId: string): string[] {
    const personFamilies = fatherToFamilies.get(personId) || [];
    const result: string[] = [];
    for (const family of personFamilies) {
      children
        .filter(
          (child) =>
            child.family_id === family.id &&
            visibleIds.has(child.person_id) &&
            !positionedAsWife.has(child.person_id),
        )
        .sort((a, b) => a.sort_order - b.sort_order)
        .forEach((child) => {
          if (!result.includes(child.person_id)) {
            result.push(child.person_id);
          }
        });
    }
    return result;
  }

  function getVisibleWife(personId: string): string | null {
    const personFamilies = fatherToFamilies.get(personId) || [];
    for (const family of personFamilies) {
      if (family.mother_id && visibleIds.has(family.mother_id)) {
        return family.mother_id;
      }
    }
    return null;
  }

  const roots: string[] = [];
  for (const person of visiblePeople) {
    if (positionedAsWife.has(person.id)) continue;
    const parentFamily = childToFamily.get(person.id);
    if (
      !parentFamily?.father_id ||
      !visibleIds.has(parentFamily.father_id)
    ) {
      roots.push(person.id);
    }
  }

  function siblingGap(childA: string, childB: string): number {
    const aHasKids =
      !collapsedNodes.has(childA) &&
      getVisibleChildrenAsFather(childA).length > 0;
    const bHasKids =
      !collapsedNodes.has(childB) &&
      getVisibleChildrenAsFather(childB).length > 0;
    return aHasKids || bHasKids ? BRANCH_GAP : SIBLING_GAP;
  }

  const subtreeWidths = new Map<string, number>();

  function computeSubtreeWidth(personId: string): number {
    if (subtreeWidths.has(personId)) {
      return subtreeWidths.get(personId)!;
    }

    const wife = getVisibleWife(personId);
    const visibleChildren = collapsedNodes.has(personId)
      ? []
      : getVisibleChildrenAsFather(personId);
    const coupleWidth = NODE_WIDTH + (wife ? COUPLE_GAP + NODE_WIDTH : 0);

    let childrenWidth = 0;
    if (visibleChildren.length > 0) {
      for (let index = 0; index < visibleChildren.length; index++) {
        childrenWidth += computeSubtreeWidth(visibleChildren[index]);
        if (index < visibleChildren.length - 1) {
          childrenWidth += siblingGap(
            visibleChildren[index],
            visibleChildren[index + 1],
          );
        }
      }
    }

    const result = Math.max(coupleWidth, childrenWidth);
    subtreeWidths.set(personId, result);
    return result;
  }

  for (const root of roots) {
    computeSubtreeWidth(root);
  }

  const xPositions = new Map<string, number>();

  function assignPositions(personId: string, startX: number) {
    const subtreeWidth = subtreeWidths.get(personId) || NODE_WIDTH;
    const wife = getVisibleWife(personId);
    const visibleChildren = collapsedNodes.has(personId)
      ? []
      : getVisibleChildrenAsFather(personId);
    const coupleWidth = NODE_WIDTH + (wife ? COUPLE_GAP + NODE_WIDTH : 0);
    const centerX = startX + subtreeWidth / 2;
    const fatherX = centerX - coupleWidth / 2;

    xPositions.set(personId, fatherX);
    if (wife) {
      xPositions.set(wife, fatherX + NODE_WIDTH + COUPLE_GAP);
    }

    if (visibleChildren.length > 0) {
      let totalChildWidth = 0;
      for (let index = 0; index < visibleChildren.length; index++) {
        totalChildWidth +=
          subtreeWidths.get(visibleChildren[index]) || NODE_WIDTH;
        if (index < visibleChildren.length - 1) {
          totalChildWidth += siblingGap(
            visibleChildren[index],
            visibleChildren[index + 1],
          );
        }
      }

      let childX = centerX - totalChildWidth / 2;
      for (let index = 0; index < visibleChildren.length; index++) {
        assignPositions(visibleChildren[index], childX);
        childX += subtreeWidths.get(visibleChildren[index]) || NODE_WIDTH;
        if (index < visibleChildren.length - 1) {
          childX += siblingGap(
            visibleChildren[index],
            visibleChildren[index + 1],
          );
        }
      }
    }
  }

  let rootStartX = 0;
  for (const root of roots) {
    assignPositions(root, rootStartX);
    rootStartX += (subtreeWidths.get(root) || NODE_WIDTH) + SIBLING_GAP * 2;
  }

  const minGeneration = Math.min(
    ...visiblePeople.map((person) => person.generation || 1),
  );
  const nodes: TreeNodeData[] = [];
  for (const person of visiblePeople) {
    if (!xPositions.has(person.id)) continue;
    nodes.push({
      person,
      x: xPositions.get(person.id)!,
      y: (person.generation - minGeneration) * LEVEL_HEIGHT + 20,
      isCollapsed: collapsedNodes.has(person.id),
      hasChildren: getVisibleChildrenAsFather(person.id).length > 0,
      isVisible: true,
    });
  }

  const connections: TreeConnectionData[] = [];
  const personPos = new Map(
    nodes.map((node) => [node.person.id, { x: node.x, y: node.y }]),
  );

  for (const family of families) {
    const fatherPos = family.father_id
      ? personPos.get(family.father_id)
      : null;
    const motherPos = family.mother_id
      ? personPos.get(family.mother_id)
      : null;
    if (!fatherPos && !motherPos) continue;

    if (fatherPos && motherPos) {
      connections.push({
        id: `couple-${family.id}`,
        x1: fatherPos.x + NODE_WIDTH,
        y1: fatherPos.y + NODE_HEIGHT / 2,
        x2: motherPos.x,
        y2: motherPos.y + NODE_HEIGHT / 2,
        type: "couple",
        isVisible: true,
      });
    }

    const parentIsCollapsed =
      (family.father_id && collapsedNodes.has(family.father_id)) ||
      (!family.father_id &&
        family.mother_id &&
        collapsedNodes.has(family.mother_id));
    if (parentIsCollapsed) continue;

    const parentPos = fatherPos ?? motherPos!;
    const familyCenterX =
      fatherPos && motherPos
        ? (fatherPos.x + NODE_WIDTH + motherPos.x) / 2
        : parentPos.x + NODE_WIDTH / 2;

    children
      .filter((child) => child.family_id === family.id)
      .forEach((child) => {
        const childPos = personPos.get(child.person_id);
        if (childPos) {
          connections.push({
            id: `child-${family.id}-${child.person_id}`,
            x1: familyCenterX,
            y1: parentPos.y + NODE_HEIGHT,
            x2: childPos.x + NODE_WIDTH / 2,
            y2: childPos.y,
            type: "parent-child",
            isVisible: true,
          });
        }
      });
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = 0;
  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + NODE_WIDTH);
    maxY = Math.max(maxY, node.y + NODE_HEIGHT);
  }
  if (!Number.isFinite(minX)) {
    minX = 0;
    maxX = 0;
  }

  return {
    nodes,
    connections,
    width: maxX - minX + 100,
    height: maxY + 50,
    offsetX: -minX + 50,
  };
}

export function FamilyTree() {
  const { data, isLoading, error } = useTreeData();

  const [scale, setScale] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 0.7 : 1,
  );
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(
    new Set(),
  );
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [showMinimap, setShowMinimap] = useState(true);
  const [filterRootId, setFilterRootId] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("root")
      : null,
  );
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 600,
  });
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const [autoCollapseApplied, setAutoCollapseApplied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (data && !autoCollapseApplied && data.people.length > 50) {
    setAutoCollapseApplied(true);

    const minGeneration = Math.min(
      ...data.people.map((person) => person.generation || 1),
    );
    const collapseFromGeneration = minGeneration + 2;

    const fathersWithChildren = new Set<string>();
    for (const family of data.families) {
      if (
        family.father_id &&
        data.children.some((child) => child.family_id === family.id)
      ) {
        fathersWithChildren.add(family.father_id);
      }
    }

    const toCollapse = new Set<string>();
    for (const person of data.people) {
      if (
        person.generation >= collapseFromGeneration &&
        fathersWithChildren.has(person.id)
      ) {
        toCollapse.add(person.id);
      }
    }

    if (toCollapse.size > 0) {
      setCollapsedNodes(toCollapse);
    }
  }

  const handleSetFilterRoot = useCallback((person: Person | null) => {
    setFilterRootId(person?.id ?? null);
    setFilterSearch("");
    setFilterDropdownOpen(false);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (person) {
        params.set("root", person.id);
      } else {
        params.delete("root");
      }
      window.history.replaceState(
        null,
        "",
        params.toString() ? `?${params.toString()}` : window.location.pathname,
      );
    }
  }, []);

  const filterRootPerson = filterRootId
    ? (data?.people.find((person) => person.id === filterRootId) ?? null)
    : null;

  const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    containerRef.current = node;
    setContainerSize({ width: node.clientWidth, height: node.clientHeight });

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (!data || data.people.length === 0) return null;
    return buildTreeLayout(
      data,
      collapsedNodes,
      viewMode,
      selectedPerson?.id || null,
      filterRootId,
    );
  }, [data, collapsedNodes, viewMode, selectedPerson?.id, filterRootId]);

  const handleExportPdf = useCallback(async () => {
    if (!containerRef.current || !layout) return;

    const warning = getExportWarning(layout.nodes.length);
    if (warning && layout.nodes.length > 100) {
      toast.warning(warning);
      return;
    }
    if (warning) toast.info(warning);

    setIsExportingPdf(true);
    try {
      toast.success("Xuất PDF thành công");
    } catch {
      toast.error("Lỗi khi xuất PDF");
    } finally {
      setIsExportingPdf(false);
    }
  }, [layout]);

  function handleZoomIn() {
    setScale((current) => Math.min(current + 0.1, 2));
  }

  function handleZoomOut() {
    setScale((current) => Math.max(current - 0.1, 0.3));
  }

  function handleReset() {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }

  const handleToggleCollapse = useCallback((personId: string) => {
    setCollapsedNodes((previous) => {
      const next = new Set(previous);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setCollapsedNodes(new Set());
  }, []);

  const handleCollapseAll = useCallback(() => {
    if (!data) return;

    const minGeneration = Math.min(
      ...data.people.map((person) => person.generation || 1),
    );
    const fathersWithChildren = new Set<string>();
    for (const family of data.families) {
      if (
        family.father_id &&
        data.children.some((child) => child.family_id === family.id)
      ) {
        fathersWithChildren.add(family.father_id);
      }
    }

    const toCollapse = new Set<string>();
    for (const person of data.people) {
      if (
        person.generation > minGeneration &&
        fathersWithChildren.has(person.id)
      ) {
        toCollapse.add(person.id);
      }
    }
    setCollapsedNodes(toCollapse);
  }, [data]);

  function handleMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      setIsPanning(true);
      setPanStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (isPanning) {
      setPan({
        x: event.clientX - panStart.x,
        y: event.clientY - panStart.y,
      });
    }
  }

  function handleMouseUp() {
    setIsPanning(false);
  }

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      setIsPanning(true);
      setPanStart({
        x: event.touches[0].clientX - pan.x,
        y: event.touches[0].clientY - pan.y,
      });
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (isPanning && event.touches.length === 1) {
      setPan({
        x: event.touches[0].clientX - panStart.x,
        y: event.touches[0].clientY - panStart.y,
      });
    }
  }

  function handleTouchEnd() {
    setIsPanning(false);
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    setScale((current) => Math.max(0.3, Math.min(2, current + delta)));
  }

  function handleMinimapClick(x: number, y: number) {
    if (!containerRef.current || !layout) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPan({
      x: -(x - rect.width / 2 / scale),
      y: -(y - rect.height / 2 / scale),
    });
  }

  function handleViewModeChange(mode: ViewMode) {
    setViewMode(mode);
    if (mode !== "all" && !selectedPerson && data?.people.length) {
      setSelectedPerson(data.people[0]);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="h-64 w-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <p className="text-destructive">
            Lỗi khi tải dữ liệu: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!layout || layout.nodes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Chưa có dữ liệu để hiển thị cây gia phả</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/people/new">Thêm thành viên đầu tiên</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const viewBox: ViewBox = {
    x: -pan.x / scale,
    y: -pan.y / scale,
    width: containerSize.width / scale,
    height: containerSize.height / scale,
  };

  const filterResults =
    data?.people
      .filter(
        (person) =>
          filterSearch.length >= 2 &&
          person.display_name
            .toLowerCase()
            .includes(filterSearch.toLowerCase()),
      )
      .slice(0, 10) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3">
        <GitBranch className="size-4 shrink-0 text-muted-foreground" />
        <span className="shrink-0 text-sm font-medium text-foreground">
          Xem nhánh từ:
        </span>

        {filterRootPerson ? (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1">
            <span className="text-sm font-medium text-foreground">
              {filterRootPerson.display_name}
            </span>
            <span className="text-xs text-muted-foreground">
              Đời {filterRootPerson.generation}
            </span>
            <button
              type="button"
              onClick={() => handleSetFilterRoot(null)}
              className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Xóa bộ lọc nhánh"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute top-1.5 left-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm thành viên..."
                value={filterSearch}
                onChange={(event) => {
                  setFilterSearch(event.target.value);
                  setFilterDropdownOpen(event.target.value.length >= 2);
                }}
                onFocus={() => {
                  if (filterSearch.length >= 2) {
                    setFilterDropdownOpen(true);
                  }
                }}
                onBlur={() =>
                  setTimeout(() => setFilterDropdownOpen(false), 200)
                }
                className="h-8 w-48 pl-8 text-sm"
              />
            </div>
            {filterDropdownOpen && (
              <div className="absolute top-full z-50 mt-1 max-h-48 w-64 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
                {filterResults.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    Không tìm thấy
                  </p>
                ) : (
                  filterResults.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onMouseDown={() => handleSetFilterRoot(person)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                          getGenderAvatarClass(person.gender),
                        )}
                      >
                        {person.display_name.slice(-1)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {person.display_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Đời {person.generation}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filterRootPerson
            ? `Nhánh ${filterRootPerson.display_name} · Đời ${filterRootPerson.generation}`
            : "Đang xem: Toàn bộ gia phả"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleZoomOut}
            aria-label="Thu nhỏ"
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="w-12 text-center text-sm text-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleZoomIn}
            aria-label="Phóng to"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleReset}
            aria-label="Đặt lại"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>

        <Select
          value={viewMode}
          onValueChange={(value) => handleViewModeChange(value as ViewMode)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Users className="size-4" />
                Tất cả
              </span>
            </SelectItem>
            <SelectItem value="ancestors">
              <span className="flex items-center gap-2">
                <ArrowUpFromLine className="size-4" />
                Tổ tiên
              </span>
            </SelectItem>
            <SelectItem value="descendants">
              <span className="flex items-center gap-2">
                <ArrowDownFromLine className="size-4" />
                Con cháu
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={handleExpandAll}
          >
            <ChevronDown className="mr-1 size-3" />
            Mở rộng
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={handleCollapseAll}
          >
            <ChevronRight className="mr-1 size-3" />
            Thu gọn
          </Button>
        </div>

        <Button
          variant={showMinimap ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowMinimap(!showMinimap)}
          className="hidden md:flex"
        >
          <Maximize2 className="mr-2 size-4" />
          Minimap
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportPdf}
          disabled={isExportingPdf || !layout}
          className="hidden md:flex"
        >
          {isExportingPdf ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 size-4" />
          )}
          PDF
        </Button>

        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Move className="size-3" />
          <span className="hidden sm:inline">Kéo để di chuyển</span>
        </div>
      </div>

      {viewMode !== "all" && selectedPerson && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {viewMode === "ancestors" ? "Tổ tiên của" : "Con cháu của"}:{" "}
            {selectedPerson.display_name}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setViewMode("all")}>
            Xem tất cả
          </Button>
        </div>
      )}

      <div
        ref={containerCallbackRef}
        className={cn(
          "relative h-[60vh] overflow-hidden rounded-lg border border-border bg-muted/30 select-none",
          isPanning ? "cursor-grabbing" : "cursor-grab",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <svg width="100%" height="100%" className="min-h-full min-w-full">
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            <g transform={`translate(${layout.offsetX}, 0)`}>
              <AnimatePresence>
                {layout.connections.map((connection) => (
                  <TreeConnection
                    key={connection.id}
                    connection={connection}
                  />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {layout.nodes.map((node) => (
                  <TreeNode
                    key={node.person.id}
                    node={node}
                    onSelect={setSelectedPerson}
                    onToggleCollapse={handleToggleCollapse}
                    isSelected={selectedPerson?.id === node.person.id}
                  />
                ))}
              </AnimatePresence>
            </g>
          </g>
        </svg>

        {showMinimap && layout.nodes.length > 3 && (
          <Minimap
            nodes={layout.nodes}
            viewBox={viewBox}
            treeWidth={layout.width}
            treeHeight={layout.height}
            onViewportClick={handleMinimapClick}
          />
        )}
      </div>

      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={selectedPerson.avatar_url} />
                    <AvatarFallback>
                      {selectedPerson.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedPerson.display_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Đời {selectedPerson.generation}
                      {selectedPerson.chi && ` • Chi ${selectedPerson.chi}`}
                      {!selectedPerson.is_living && " • Đã mất"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {viewMode === "all" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewModeChange("ancestors")}
                      >
                        <ArrowUpFromLine className="mr-1 size-4" />
                        <span className="hidden sm:inline">Tổ tiên</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewModeChange("descendants")}
                      >
                        <ArrowDownFromLine className="mr-1 size-4" />
                        <span className="hidden sm:inline">Con cháu</span>
                      </Button>
                    </>
                  )}
                  <Button asChild size="sm">
                    <Link href={`/people/${selectedPerson.id}`}>
                      Xem chi tiết
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
