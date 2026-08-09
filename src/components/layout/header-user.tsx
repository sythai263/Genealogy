/**
 * @project AncestorTree
 * @file src/components/layout/header-user.tsx
 * @description Compact user badge for the top header bar.
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LogOut, ShieldCheck, UserCircle } from 'lucide-react';
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
} from '@components/ui';

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  }
  return (email?.charAt(0) ?? '?').toUpperCase();
}

export function HeaderUser() {
  const t = useTranslations('Layout');
  const { user, profile, signOut } = useAuth();
  if (!user) return null;

  const roleKey = profile?.role ?? 'viewer';
  const roleLabel =
    roleKey === 'admin' ||
    roleKey === 'editor' ||
    roleKey === 'viewer' ||
    roleKey === 'guest'
      ? t(`roles.${roleKey}`)
      : roleKey;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('auth.account')}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
              {getInitials(profile?.full_name, user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium max-w-35 truncate">
            {profile?.full_name || user.email}
          </span>
          <span className="hidden md:block text-xs text-muted-foreground">
            {roleLabel}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
          {user.email}
        </div>
        <DropdownMenuSeparator />
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
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
