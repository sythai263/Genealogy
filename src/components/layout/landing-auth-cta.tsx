/**
 * @project AncestorTree
 * @file src/components/layout/landing-auth-cta.tsx
 * @description Landing CTA — Login for guests, app/admin entry when authenticated
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, LogIn, Shield } from 'lucide-react';
import { useAuth } from '@components/auth';
import { Button } from '@components/ui';
import { cn } from '@lib';

interface LandingAuthCtaProps {
  /** `nav` — compact top-bar link style; `header` — outline button */
  variant?: 'nav' | 'header';
  className?: string;
}

export function LandingAuthCta({
  variant = 'nav',
  className,
}: LandingAuthCtaProps) {
  const t = useTranslations('Layout');
  const { user, isLoading, isAdmin, isEditor } = useAuth();

  if (isLoading) {
    return (
      <span
        className={cn(
          'inline-block h-8 w-20 animate-pulse rounded-md bg-muted',
          variant === 'nav' && 'h-5 w-16 bg-muted',
          className
        )}
        aria-hidden
      />
    );
  }

  if (!user) {
    if (variant === 'header') {
      return (
        <Button
          asChild
          size="sm"
          variant="outline"
          className={cn('h-9 shrink-0 gap-1.5', className)}
        >
          <Link href="/login" aria-label={t('auth.login')}>
            <LogIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('auth.login')}</span>
          </Link>
        </Button>
      );
    }

    return (
      <Link
        href="/login"
        className={cn(
          'inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
          className
        )}
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>{t('auth.login')}</span>
      </Link>
    );
  }

  const canAdmin = isAdmin || isEditor;
  const href = canAdmin ? '/admin' : '/tree';
  const label = canAdmin ? t('auth.enterAdmin') : t('auth.enterApp');
  const Icon = canAdmin ? Shield : LayoutDashboard;

  if (variant === 'header') {
    return (
      <Button
        asChild
        size="sm"
        className={cn('h-9 shrink-0 gap-1.5', className)}
      >
        <Link href={href} aria-label={label}>
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      </Button>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300',
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Link>
  );
}
