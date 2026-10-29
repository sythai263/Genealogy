/**
 * @project AncestorTree
 * @file src/components/layout/sidebar-footer-auth.tsx
 * @description Sidebar footer auth section — user dropdown (profile,
 *              security, sign out) when signed in, login/register links
 *              otherwise
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ChevronUp,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCircle,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@components/ui';

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface SidebarFooterAuthProps {
  pathname: string;
}

export function SidebarFooterAuth({ pathname }: SidebarFooterAuthProps) {
  const t = useTranslations('Layout');
  const { user, profile, signOut } = useAuth();

  const roleKey = profile?.role ?? 'viewer';
  const roleLabel =
    roleKey === 'admin' ||
    roleKey === 'editor' ||
    roleKey === 'viewer' ||
    roleKey === 'guest'
      ? t(`roles.${roleKey}`)
      : roleKey;

  return (
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
  );
}
