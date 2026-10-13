/**
 * @project AncestorTree
 * @file src/app/(landing)/page.tsx
 * @description Public home `/` — clan introduction (logged in or not)
 * @version 4.0.0
 * @updated 2026-10-09
 */

import { ClanOverview } from '@components/home';
import { Button, Card, CardContent } from '@components/ui';
import { CLAN_FULL_NAME, CLAN_NAME } from '@lib';
import {
  ChevronRight,
  GitBranch,
  Landmark,
  LogIn,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const EXPLORE_KEYS = ['tree', 'council', 'hall', 'register'] as const;

const EXPLORE_ITEMS: Record<
  (typeof EXPLORE_KEYS)[number],
  { href: string; icon: LucideIcon }
> = {
  tree: { href: '/family-tree', icon: GitBranch },
  council: { href: '/council', icon: Users },
  hall: { href: '/ancestral-hall', icon: Landmark },
  register: { href: '/register-member', icon: UserPlus },
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');
  return {
    title: t('landing.title', { clanFullName: CLAN_FULL_NAME }),
    description: t('landing.description', { clanFullName: CLAN_FULL_NAME }),
    alternates: {
      canonical: 'https://ancestortree.info/',
    },
    openGraph: {
      title: t('landing.title', { clanFullName: CLAN_FULL_NAME }),
      description: t('landing.ogDescription'),
      type: 'website',
      locale: 'vi_VN',
      url: 'https://ancestortree.info/',
      images: [
        {
          url: '/og-landing.png',
          width: 1200,
          height: 630,
          alt: CLAN_FULL_NAME,
        },
      ],
    },
  };
}

export default async function WelcomePage() {
  const t = await getTranslations('Landing');

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-800 to-emerald-950 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute right-20 bottom-10 h-96 w-96 rounded-full bg-emerald-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-32 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {CLAN_FULL_NAME}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-emerald-100 sm:text-xl">
            {t('hero.tagline')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/family-tree">
                <GitBranch className="mr-2 h-5 w-5" />
                {t('hero.ctaTree')}
              </Link>
            </Button>
            <Button
              size="lg"
              className="border border-white/30 bg-card/10 text-white hover:bg-card/20"
              asChild
            >
              <a href="#about">{t('hero.ctaAbout')}</a>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="link"
              className="text-emerald-200 hover:text-white"
              asChild
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                {t('hero.login')}
              </Link>
            </Button>
            <span className="text-emerald-400">|</span>
            <Button
              variant="link"
              className="text-emerald-200 hover:text-white"
              asChild
            >
              <Link href="/register">{t('hero.register')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {t('about.title')}
            </h2>
          </div>
          <ClanOverview />
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('explore.title')}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {t('explore.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EXPLORE_KEYS.map((key) => {
              const { href, icon: Icon } = EXPLORE_ITEMS[key];
              return (
                <Link key={key} href={href} className="group">
                  <Card className="h-full border-0 shadow-sm transition-shadow group-hover:shadow-md">
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="flex items-center font-semibold text-foreground">
                        {t(`explore.${key}.title`)}
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t(`explore.${key}.desc`)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('members.title', { clanName: CLAN_NAME })}
            </h2>
            <p className="mb-8 text-muted-foreground">
              {t('members.subtitle')}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  {t('members.login')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register-member">
                  <UserPlus className="mr-2 h-5 w-5" />
                  {t('members.registerMember')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌳</span>
              <span className="font-semibold text-foreground/80">
                {CLAN_NAME}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/family-tree" className="hover:text-foreground/80">
                {t('footer.tree')}
              </Link>
              <Link href="/council" className="hover:text-foreground/80">
                {t('footer.council')}
              </Link>
              <Link href="/ancestral-hall" className="hover:text-foreground/80">
                {t('footer.hall')}
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t('footer.copyright', {
              year: new Date().getFullYear(),
              clanFullName: CLAN_FULL_NAME,
            })}
          </p>
        </div>
      </footer>
    </div>
  );
}
