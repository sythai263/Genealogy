/**
 * @project AncestorTree
 * @file src/components/layout/sidebar-nav-menu.tsx
 * @description Shared sidebar nav menu renderer — maps NavItemDef entries to
 *              SidebarMenuItem + link with active-state highlighting
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@components/ui';
import type { NavItemDef } from '@constants';
import { isNavItemActive } from '@lib';

interface SidebarNavMenuProps {
  items: NavItemDef[];
  pathname: string;
}

export function SidebarNavMenu({ items, pathname }: SidebarNavMenuProps) {
  const t = useTranslations('Layout');

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            asChild
            tooltip={t(`nav.${item.titleKey}`)}
            isActive={isNavItemActive(item.url, pathname)}
            className="data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary"
          >
            <Link href={item.url}>
              <item.icon className="h-4 w-4" />
              <span>{t(`nav.${item.titleKey}`)}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
