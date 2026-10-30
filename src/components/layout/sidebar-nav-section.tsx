/**
 * @project AncestorTree
 * @file src/components/layout/sidebar-nav-section.tsx
 * @description One labelled, collapsible sidebar group with a slide
 *              animation. Open state is controlled by the sidebar accordion;
 *              items stay visible in icon-rail mode so every entry remains
 *              reachable. The label is tinted when it holds the active route.
 * @version 2.0.0
 * @updated 2026-10-30
 */

'use client';

import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from '@components/ui';
import type { NavGroupDef } from '@constants';
import { cn } from '@lib';
import { SidebarNavMenu } from './sidebar-nav-menu';

interface SidebarNavSectionProps {
  group: NavGroupDef;
  pathname: string;
  open: boolean;
  /** True when one of the group's entries is the current route. */
  active: boolean;
  onToggle: () => void;
}

export function SidebarNavSection({
  group,
  pathname,
  open,
  active,
  onToggle,
}: SidebarNavSectionProps) {
  const t = useTranslations('Layout');
  const { state } = useSidebar();
  const expanded = open || state === 'collapsed';

  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel
        asChild
        className={cn(
          'cursor-pointer transition-colors select-none hover:text-foreground',
          active && 'text-primary'
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center justify-between"
        >
          <span>{t(`groups.${group.labelKey}`)}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </SidebarGroupLabel>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <SidebarGroupContent className="overflow-hidden" inert={!expanded}>
          <SidebarNavMenu items={group.items} pathname={pathname} />
        </SidebarGroupContent>
      </div>
    </SidebarGroup>
  );
}
