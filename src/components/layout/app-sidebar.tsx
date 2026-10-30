/**
 * @project AncestorTree
 * @file src/components/layout/app-sidebar.tsx
 * @description Main navigation sidebar — clan header, filtered nav groups
 *              (main, account, admin), footer auth. Nav definitions live in
 *              constants/navigation; group/footer components are siblings.
 * @version 5.0.0
 * @updated 2026-10-30
 */

'use client';

import Link from 'next/link';
import { ClanLogo } from './clan-logo';
import { SidebarNavSection } from './sidebar-nav-section';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
} from '@components/ui';
import { useAuth } from '@components/auth';
import {
  ACCOUNT_NAV_GROUP,
  ADMIN_NAV_GROUPS,
  ELDERLY_ADMIN_URLS,
  ELDERLY_NAV_URLS,
  HOME_NAV_ITEM,
  MAIN_NAV_GROUPS,
  type NavGroupDef,
  type NavItemDef,
} from '@constants';
import { useElderly } from '@contexts';
import { useClanSettings, useNavAccordion } from '@hooks';
import {
  CLAN_FULL_NAME,
  CLAN_NAME,
  deriveClanSubtitle,
} from '@lib';
import { SidebarFooterAuth } from './sidebar-footer-auth';
import { SidebarNavMenu } from './sidebar-nav-menu';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isEditor } = useAuth();
  const { elderlyMode } = useElderly();
  const { data: cs } = useClanSettings();
  const clanName = cs?.clan_name ?? CLAN_NAME;
  const clanFullName = cs?.clan_full_name ?? CLAN_FULL_NAME;
  const clanSubtitle = deriveClanSubtitle(clanFullName, clanName);

  function isVisible(item: NavItemDef) {
    return (
      (!item.adminHome || isAdmin || isEditor) &&
      (!item.viewerHidden || isEditor) &&
      (!elderlyMode || ELDERLY_NAV_URLS.has(item.url))
    );
  }

  function isVisibleAdmin(item: NavItemDef) {
    return !elderlyMode || ELDERLY_ADMIN_URLS.has(item.url);
  }

  function visibleGroups(
    defs: NavGroupDef[],
    filter: (item: NavItemDef) => boolean
  ) {
    return defs
      .map((group) => ({ ...group, items: group.items.filter(filter) }))
      .filter((group) => group.items.length > 0);
  }

  const navGroups = [
    ...visibleGroups(MAIN_NAV_GROUPS, isVisible),
    ...(user ? [ACCOUNT_NAV_GROUP] : []),
    ...(isAdmin || isEditor
      ? visibleGroups(ADMIN_NAV_GROUPS, isVisibleAdmin)
      : []),
  ];
  const { openKey, activeKey, toggle } = useNavAccordion(navGroups, pathname);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-3">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col">
          <Link
            href={isAdmin || isEditor ? '/admin' : '/tree'}
            className="flex min-w-0 items-center gap-3"
          >
            <ClanLogo
              size={40}
              className="text-foreground group-data-[collapsible=icon]:h-5"
            />
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-sm">{clanName}</span>
              {clanSubtitle && (
                <span className="truncate text-xs text-muted-foreground">
                  {clanSubtitle}
                </span>
              )}
            </div>
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isVisible(HOME_NAV_ITEM) && (
          <SidebarGroup className="pb-0">
            <SidebarGroupContent>
              <SidebarNavMenu items={[HOME_NAV_ITEM]} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {navGroups.map((group) => (
          <SidebarNavSection
            key={group.labelKey}
            group={group}
            pathname={pathname}
            open={openKey === group.labelKey}
            active={activeKey === group.labelKey}
            onToggle={() => toggle(group.labelKey)}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarFooterAuth pathname={pathname} />
      </SidebarFooter>
    </Sidebar>
  );
}
