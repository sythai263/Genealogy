/**
 * @project AncestorTree
 * @file src/components/layout/app-sidebar.tsx
 * @description Main navigation sidebar component
 * @version 3.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui';
import {
  Home,
  GitBranchPlus,
  Users,
  BookUser,
  Calendar,
  FileText,
  Settings,
  UserCog,
  ClipboardList,
  LogOut,
  LogIn,
  UserPlus,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  UserCircle,
  Trophy,
  BookOpen,
  ScrollText,
  RotateCcw,
  DatabaseBackup,
  HelpCircle,
  Download,
  Upload,
  Copy,
  Route,
  BarChart3,
  MessageSquare,
  Bell,
  Landmark,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@components/auth';
import { ELDERLY_ADMIN_URLS, ELDERLY_NAV_URLS } from '@constants';
import { useElderly } from '@contexts';
import { CLAN_NAME, CLAN_FULL_NAME } from '@lib';
import { useClanSettings } from '@hooks';
import type { AppMessages } from '@messages/types';

type LayoutNavKey = keyof AppMessages['Layout']['nav'];

interface NavItemDef {
  titleKey: LayoutNavKey;
  url: string;
  icon: LucideIcon;
  adminHome?: boolean;
  viewerHidden?: boolean;
}

function deriveInitial(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[parts.length - 1][0] ?? '?')
    : (parts[0][0] ?? '?');
}

function deriveSubtitle(fullName: string, shortName: string): string {
  return fullName.startsWith(shortName)
    ? fullName.slice(shortName.length).trim()
    : '';
}

const mainNavItems: NavItemDef[] = [
  { titleKey: 'home', url: '/admin', icon: Home, adminHome: true },
  { titleKey: 'tree', url: '/tree', icon: GitBranchPlus },
  { titleKey: 'people', url: '/people', icon: Users },
  { titleKey: 'directory', url: '/directory', icon: BookUser, viewerHidden: true },
  { titleKey: 'events', url: '/events', icon: Calendar },
  { titleKey: 'contributions', url: '/contributions', icon: ClipboardList },
  { titleKey: 'achievements', url: '/achievements', icon: Trophy },
  { titleKey: 'fund', url: '/fund', icon: BookOpen },
  { titleKey: 'charter', url: '/charter', icon: ScrollText },
  { titleKey: 'relationship', url: '/relationship', icon: Route },
  { titleKey: 'stats', url: '/stats', icon: BarChart3 },
  { titleKey: 'cauDuong', url: '/cau-duong', icon: RotateCcw },
  { titleKey: 'feed', url: '/feed', icon: MessageSquare },
  { titleKey: 'notifications', url: '/notifications', icon: Bell },
  { titleKey: 'documents', url: '/documents', icon: FileText },
  { titleKey: 'help', url: '/help', icon: HelpCircle },
];

const accountNavItems: NavItemDef[] = [
  { titleKey: 'profile', url: '/settings/profile', icon: UserCircle },
  { titleKey: 'security', url: '/settings/security', icon: ShieldCheck },
];

const adminNavItems: NavItemDef[] = [
  { titleKey: 'adminDashboard', url: '/admin', icon: Settings },
  { titleKey: 'adminUsers', url: '/admin/users', icon: UserCog },
  { titleKey: 'adminContributions', url: '/admin/contributions', icon: ClipboardList },
  { titleKey: 'adminEvents', url: '/admin/events', icon: Calendar },
  { titleKey: 'adminAchievements', url: '/admin/achievements', icon: Trophy },
  { titleKey: 'adminFund', url: '/admin/fund', icon: BookOpen },
  { titleKey: 'adminCharter', url: '/admin/charter', icon: ScrollText },
  { titleKey: 'adminCauDuong', url: '/admin/cau-duong', icon: RotateCcw },
  { titleKey: 'adminDocuments', url: '/admin/documents', icon: FileText },
  { titleKey: 'adminFeed', url: '/admin/feed', icon: MessageSquare },
  { titleKey: 'adminExport', url: '/admin/export', icon: Download },
  { titleKey: 'adminImport', url: '/admin/import', icon: Upload },
  { titleKey: 'adminSpouses', url: '/admin/spouses', icon: Heart },
  { titleKey: 'adminDuplicates', url: '/admin/duplicates', icon: Copy },
  { titleKey: 'adminRegistrations', url: '/admin/registrations', icon: Landmark },
  { titleKey: 'adminSettings', url: '/admin/settings', icon: Settings },
  { titleKey: 'adminBackup', url: '/admin/backup', icon: DatabaseBackup },
];

interface AdminNavGroupProps {
  pathname: string;
  elderlyMode: boolean;
}

function AdminNavGroup({ pathname, elderlyMode }: AdminNavGroupProps) {
  const t = useTranslations('Layout');
  const isAdminPath = pathname.startsWith('/admin');
  const [open, setOpen] = useState(isAdminPath);

  const items = adminNavItems.filter(
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
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    item.url === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.url)
                  }
                >
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{t(`nav.${item.titleKey}`)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations('Layout');
  const { user, profile, isAdmin, isEditor, signOut } = useAuth();
  const { elderlyMode } = useElderly();
  const { data: cs } = useClanSettings();
  const clanName = cs?.clan_name ?? CLAN_NAME;
  const clanFullName = cs?.clan_full_name ?? CLAN_FULL_NAME;
  const clanInitial = deriveInitial(clanName);
  const clanSubtitle = deriveSubtitle(clanFullName, clanName);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const roleKey = profile?.role ?? 'viewer';
  const roleLabel =
    roleKey === 'admin' ||
    roleKey === 'editor' ||
    roleKey === 'viewer' ||
    roleKey === 'guest'
      ? t(`roles.${roleKey}`)
      : roleKey;

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
            <SidebarMenu>
              {mainNavItems
                .filter((item) => !item.adminHome || isAdmin || isEditor)
                .filter((item) => !item.viewerHidden || isEditor)
                .filter(
                  (item) => !elderlyMode || ELDERLY_NAV_URLS.has(item.url)
                )
                .map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.url === '/admin'
                          ? pathname === '/admin'
                          : pathname.startsWith(item.url)
                      }
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{t(`nav.${item.titleKey}`)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('groups.account')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountNavItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.url)}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{t(`nav.${item.titleKey}`)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isAdmin || isEditor) && (
          <AdminNavGroup pathname={pathname} elderlyMode={elderlyMode} />
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">
                        {profile?.full_name || user?.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {roleLabel}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      {t('auth.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/security">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {t('auth.security')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/login'}>
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    <span>{t('auth.login')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/register'}>
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    <span>{t('auth.register')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
