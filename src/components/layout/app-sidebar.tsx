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
  deriveClanInitial,
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
  const clanInitial = deriveClanInitial(clanName);
  const clanSubtitle = deriveClanSubtitle(clanFullName, clanName);

  const mainItems = MAIN_NAV_ITEMS.filter(
    (item) => !item.adminHome || isAdmin || isEditor
  )
    .filter((item) => !item.viewerHidden || isEditor)
    .filter((item) => !elderlyMode || ELDERLY_NAV_URLS.has(item.url));

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <Link
          href={isAdmin || isEditor ? '/admin' : '/tree'}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            {clanInitial}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{clanName}</span>
            {clanSubtitle && (
              <span className="text-xs text-muted-foreground">{clanSubtitle}</span>
            )}
          </div>
        </Link>
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
