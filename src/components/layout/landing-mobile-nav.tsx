/**
 * @project AncestorTree
 * @file src/components/layout/landing-mobile-nav.tsx
 * @description Mobile hamburger menu — nav links + locale/theme/auth controls
 * @version 1.0.0
 * @updated 2026-10-30
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@components/ui';
import { CLAN_NAME, cn } from '@lib';
import { LandingAuthCta } from './landing-auth-cta';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

export function LandingMobileNav() {
  const t = useTranslations('Landing');
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/family-tree', label: t('nav.tree') },
    { href: '/council', label: t('nav.council') },
    { href: '/ancestral-hall', label: t('nav.ancestralHall') },
    { href: '/register-member', label: t('nav.registerMember') },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Menu"
        >
          <span className="relative block h-5 w-5">
            <Menu
              className={cn(
                'absolute inset-0 h-5 w-5 transition-all duration-200',
                open ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
              )}
            />
            <X
              className={cn(
                'absolute inset-0 h-5 w-5 transition-all duration-200',
                open ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              )}
            />
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-4">
        <SheetHeader>
          <SheetTitle>{CLAN_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex items-center gap-3 border-t pt-4">
          <LocaleSwitcher />
          <ThemeToggle />
          <LandingAuthCta variant="nav" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
