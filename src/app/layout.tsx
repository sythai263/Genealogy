/**
 * @project AncestorTree
 * @file src/app/layout.tsx
 * @description Root layout with providers (Auth, Tooltip, Toaster, i18n)
 * @version 2.1.0
 * @updated 2026-08-09
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import './globals.css';
import { AuthProvider } from '@components/auth';
import { QueryProvider, ThemeProvider } from '@components/providers';
import { TooltipProvider, Toaster } from '@components/ui';
import { CLAN_NAME, CLAN_FULL_NAME } from '@lib';
import '@i18n/global';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');
  const locale = await getLocale();

  return {
    title: {
      default: t('root.titleDefault', { clanFullName: CLAN_FULL_NAME }),
      template: t('root.titleTemplate', { clanName: CLAN_NAME }),
    },
    description: t('root.description', { clanFullName: CLAN_FULL_NAME }),
    keywords: t('root.keywords')
      .split(',')
      .map((k) => k.trim()),
    authors: [{ name: CLAN_FULL_NAME }],
    openGraph: {
      title: t('root.ogTitle', { clanFullName: CLAN_FULL_NAME }),
      description: t('root.ogDescription'),
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'vi_VN',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <TooltipProvider>
                  {children}
                  <Toaster />
                </TooltipProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
