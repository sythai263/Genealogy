/**
 * @project AncestorTree
 * @file src/app/(landing)/layout.tsx
 * @description Landing route group layout — no sidebar, clean public shell
 * @version 2.3.0
 * @updated 2026-08-09
 */

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LandingAuthCta, LocaleSwitcher, ThemeToggle } from '@components/layout';
import { CLAN_NAME } from '@lib';

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('Landing');

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🌳</span>
              <span className="font-semibold text-foreground">{CLAN_NAME}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/family-tree"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('nav.tree')}
            </Link>
            <Link
              href="/council"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              {t('nav.council')}
            </Link>
            <Link
              href="/ancestral-hall"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              {t('nav.ancestralHall')}
            </Link>
            <Link
              href="/register-member"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
            >
              {t('nav.registerMember')}
            </Link>
            <LocaleSwitcher />
            <ThemeToggle />
            <LandingAuthCta variant="nav" />
          </div>
        </div>
      </nav>

      <main className="pt-14">{children}</main>
    </div>
  );
}
