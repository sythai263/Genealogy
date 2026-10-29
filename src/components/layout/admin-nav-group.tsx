/**
 * @project AncestorTree
 * @file src/components/layout/admin-nav-group.tsx
 * @description Collapsible "Admin" sidebar group — auto-opens when the
 *              current path is under /admin, filters entries in elderly mode
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@components/ui';
import {
  ADMIN_NAV_ITEMS,
  ELDERLY_ADMIN_URLS,
} from '@constants';
import { SidebarNavMenu } from './sidebar-nav-menu';

interface AdminNavGroupProps {
  pathname: string;
  elderlyMode: boolean;
}

export function AdminNavGroup({ pathname, elderlyMode }: AdminNavGroupProps) {
  const t = useTranslations('Layout');
  const isAdminPath = pathname.startsWith('/admin');
  const [open, setOpen] = useState(isAdminPath);

  const items = ADMIN_NAV_ITEMS.filter(
    (item) => !elderlyMode || ELDERLY_ADMIN_URLS.has(item.url)
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel
        className="cursor-pointer select-none flex items-center justify-between hover:text-foreground transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{t('groups.admin')}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </SidebarGroupLabel>
      {open && (
        <SidebarGroupContent>
          <SidebarNavMenu items={items} pathname={pathname} />
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}
