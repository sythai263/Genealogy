/**
 * @project AncestorTree
 * @file src/components/layout/app-sidebar.tsx
 * @description Main navigation sidebar — clan header, filtered nav groups
 *              (main, account, admin), footer auth. Nav definitions live in
 *              constants/navigation; group/footer components are siblings.
 * @version 4.0.0
 * @updated 2026-10-29
 */

'use client';

import Link from 'next/link';
import { ClanLogo } from './clan-logo';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from '@components/ui';
import { useAuth } from '@components/auth';
import {
  ACCOUNT_NAV_ITEMS,
  ELDERLY_NAV_URLS,
  MAIN_NAV_ITEMS,
} from '@constants';
import { useElderly } from '@contexts';
import { useClanSettings } from '@hooks';
import {
  CLAN_FULL_NAME,
  CLAN_NAME,
  deriveClanSubtitle,
} from '@lib';
import { AdminNavGroup } from './admin-nav-group';
import { SidebarFooterAuth } from './sidebar-footer-auth';
import { SidebarNavMenu } from './sidebar-nav-menu';

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations('Layout');
  const { user, isAdmin, isEditor } = useAuth();
  const { elderlyMode } = useElderly();
  const { data: cs } = useClanSettings();
  const clanName = cs?.clan_name ?? CLAN_NAME;
  const clanFullName = cs?.clan_full_name ?? CLAN_FULL_NAME;
  const clanSubtitle = deriveClanSubtitle(clanFullName, clanName);

  const mainItems = MAIN_NAV_ITEMS.filter(
    (item) => !item.adminHome || isAdmin || isEditor
  )
    .filter((item) => !item.viewerHidden || isEditor)
    .filter((item) => !elderlyMode || ELDERLY_NAV_URLS.has(item.url));

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
        <SidebarGroup>
          <SidebarGroupLabel>{t('groups.main')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNavMenu items={mainItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('groups.account')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarNavMenu items={ACCOUNT_NAV_ITEMS} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isAdmin || isEditor) && (
          <AdminNavGroup pathname={pathname} elderlyMode={elderlyMode} />
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarFooterAuth pathname={pathname} />
      </SidebarFooter>
    </Sidebar>
  );
}
