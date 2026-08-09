/**
 * @project AncestorTree
 * @file src/app/(landing)/page.tsx
 * @description Public home `/` — welcome landing (logged in or not)
 * @version 3.2.0
 * @updated 2026-08-09
 */

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { CLAN_FULL_NAME, CLAN_NAME } from '@lib';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bug,
  Calendar,
  ChevronRight,
  FileDown,
  GitBranch,
  Heart,
  Landmark,
  Lightbulb,
  LogIn,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Rocket,
  Route,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const FEATURE_KEYS = [
  'tree',
  'calendar',
  'branches',
  'achievements',
  'charter',
  'cauDuong',
  'relations',
  'security',
  'feed',
  'relationship',
  'stats',
  'exportImport',
  'notifications',
  'hall',
  'register',
  'search',
] as const;

const FEATURE_ICONS: Record<(typeof FEATURE_KEYS)[number], LucideIcon> = {
  tree: GitBranch,
  calendar: Calendar,
  branches: Users,
  achievements: Award,
  charter: BookOpen,
  cauDuong: Utensils,
  relations: Heart,
  security: Shield,
  feed: MessageSquare,
  relationship: Route,
  stats: BarChart3,
  exportImport: FileDown,
  notifications: Bell,
  hall: Landmark,
  register: UserPlus,
  search: Search,
};

const FEATURE_STYLES: Record<
  (typeof FEATURE_KEYS)[number],
  { color: string; bg: string }
> = {
  tree: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  calendar: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
  },
  branches: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
  },
  achievements: {
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
  },
  charter: {
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
  },
  cauDuong: {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
  },
  relations: {
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-950/50',
  },
  security: {
    color: 'text-slate-600 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
  },
  feed: {
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  relationship: {
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
  },
  stats: {
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
  },
  exportImport: {
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/50',
  },
  notifications: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/50',
  },
  hall: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/50',
  },
  register: {
    color: 'text-lime-600 dark:text-lime-400',
    bg: 'bg-lime-50 dark:bg-lime-950/50',
  },
  search: {
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/50',
  },
};

const NAV_ITEM_KEYS = [
  'home',
  'tree',
  'people',
  'directory',
  'events',
  'feed',
  'relationship',
  'stats',
  'notifications',
  'achievements',
  'fund',
  'charter',
  'cauDuong',
  'documents',
  'exportImport',
  'admin',
] as const;

const WORKFLOW_KEYS = ['addPerson', 'viewTree', 'events', 'backup'] as const;

const FAQ_KEYS = ['dataLoss', 'backup', 'capacity', 'permissions'] as const;

const SCREENSHOT_KEYS = ['tree', 'people', 'admin', 'mobile'] as const;

const SCREENSHOT_SRCS: Record<(typeof SCREENSHOT_KEYS)[number], string> = {
  tree: '/screenshots/tree-view.png',
  people: '/screenshots/people-list.png',
  admin: '/screenshots/admin-panel.png',
  mobile: '/screenshots/mobile-view.png',
};

const techStack = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'Tailwind CSS 4',
  'Supabase (PostgreSQL)',
  'shadcn/ui',
];

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
  const tips = t.raw('guide.tips') as string[];
  const verifySteps = t.raw('contact.verifySteps') as string[];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-800 to-emerald-950 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute right-20 bottom-10 h-96 w-96 rounded-full bg-emerald-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-32 lg:px-8">
          <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm">
            {t('hero.badge')}
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {CLAN_FULL_NAME}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-emerald-100 sm:text-xl">
            {t('hero.tagline')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <a href="#quickstart">
                <Rocket className="mr-2 h-5 w-5" />
                {t('hero.ctaStart')}
              </a>
            </Button>
            <Button
              size="lg"
              className="border border-white/30 bg-card/10 text-white hover:bg-card/20"
              asChild
            >
              <a href="#contact">
                <Mail className="mr-2 h-5 w-5" />
                {t('hero.ctaContact')}
              </a>
            </Button>
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-3">
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
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('features.title')}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_KEYS.map((key) => {
              const Icon = FEATURE_ICONS[key];
              const style = FEATURE_STYLES[key];
              return (
                <Card
                  key={key}
                  className="border-0 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${style.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${style.color}`} />
                    </div>
                    <CardTitle className="text-base">
                      {t(`features.items.${key}.title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(`features.items.${key}.desc`)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('screenshots.title')}
            </h2>
            <p className="text-muted-foreground">{t('screenshots.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {SCREENSHOT_KEYS.map((key) => (
              <div
                key={key}
                className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SCREENSHOT_SRCS[key]}
                  alt={t(`screenshots.${key}.alt`)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute bottom-3 left-4 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {t(`screenshots.${key}.label`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="guide" className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('guide.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t('guide.subtitle')}
            </p>
          </div>

          <div className="mb-14">
            <h3 className="mb-4 text-center text-lg font-semibold text-foreground">
              {t('guide.navTitle')}
            </h3>
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {NAV_ITEM_KEYS.map((key) => (
                <div
                  key={key}
                  className="rounded-lg border bg-card px-4 py-3 shadow-sm"
                >
                  <p className="text-sm font-medium text-foreground">
                    {t(`guide.navItems.${key}.name`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`guide.navItems.${key}.desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mb-14 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {WORKFLOW_KEYS.map((key) => {
              const steps = t.raw(
                `guide.workflows.${key}.steps`
              ) as string[];
              return (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {t(`guide.workflows.${key}.title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {steps.map((step, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-muted-foreground"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mx-auto max-w-3xl">
            <h3 className="mb-4 text-center text-lg font-semibold text-foreground">
              {t('guide.tipsTitle')}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm"
                >
                  <span className="shrink-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    #{i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="quickstart" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('quickstart.title')}
            </h2>
            <p className="text-muted-foreground">{t('quickstart.subtitle')}</p>
          </div>

          <div className="mx-auto mb-10 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-lg">
                  {t('quickstart.localTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm leading-relaxed text-zinc-100">
                  <p className="text-zinc-400">{t('quickstart.comment')}</p>
                  <p>cd frontend</p>
                  <p>
                    pnpm install &amp;&amp; pnpm local:setup &amp;&amp; pnpm
                    dev
                  </p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('quickstart.openAt')}{' '}
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">
                      http://localhost:4000
                    </span>{' '}
                    {t('quickstart.loginHint')}{' '}
                    <span className="font-mono">admin@giapha.local</span> /{' '}
                    <span className="font-mono">admin123</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('quickstart.meta')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('faq.title')}
            </h2>
            <p className="text-muted-foreground">{t('faq.subtitle')}</p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {FAQ_KEYS.map((key) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <h4 className="mb-2 font-semibold text-foreground">
                    {t(`faq.items.${key}.q`)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t(`faq.items.${key}.a`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('community.title')}
            </h2>
            <p className="text-muted-foreground">{t('community.subtitle')}</p>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-3 pt-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/50">
                  <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold">{t('community.bug.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('community.bug.desc')}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="#contact">
                    {t('community.bug.action')}{' '}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-3 pt-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold">
                  {t('community.feature.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('community.feature.desc')}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="#contact">
                    {t('community.feature.action')}{' '}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-3 pt-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                  <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold">
                  {t('community.discuss.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('community.discuss.desc')}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="#contact">
                    {t('community.discuss.action')}{' '}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="bg-emerald-50 py-20 dark:bg-emerald-950/30"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('contact.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t('contact.subtitle', {
                clanFullName: CLAN_FULL_NAME,
                clanName: CLAN_NAME,
              })}
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('contact.author')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base font-semibold text-foreground">
                  Đặng Thế Tài
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:dangtt1971@gmail.com"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    dangtt1971@gmail.com
                  </a>
                  <a
                    href="tel:0939116006"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    0939 116 006
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-3">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-lg">
                  {t('contact.verifyTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {verifySteps.map((step, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-muted-foreground"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/register">
                      {t('contact.registerCta')}{' '}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">
              {t('members.title', { clanName: CLAN_NAME })}
            </h2>
            <p className="mb-8 text-muted-foreground">
              {t('members.subtitle')}
            </p>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {techStack.map((stack) => (
                <Badge key={stack} variant="secondary" className="text-sm">
                  {stack}
                </Badge>
              ))}
            </div>
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
              <a href="#contact" className="hover:text-foreground/80">
                {t('footer.contact')}
              </a>
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
