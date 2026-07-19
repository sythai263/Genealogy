/**
 * @project AncestorTree
 * @file src/app/(landing)/layout.tsx
 * @description Landing route group layout — no sidebar, clean public shell
 * @version 2.1.0
 * @updated 2026-07-19
 */

import Link from 'next/link';
import { LandingAuthCta } from '@components/layout';
import { CLAN_NAME } from '@lib';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🌳</span>
              <span className="font-semibold text-gray-900">{CLAN_NAME}</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/family-tree"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              Cây gia phả
            </Link>
            <Link
              href="/council"
              className="hidden text-sm text-gray-600 transition-colors hover:text-gray-900 sm:inline"
            >
              Hội đồng
            </Link>
            <Link
              href="/ancestral-hall"
              className="hidden text-sm text-gray-600 transition-colors hover:text-gray-900 sm:inline"
            >
              Nhà thờ
            </Link>
            <Link
              href="/register-member"
              className="hidden text-sm text-gray-600 transition-colors hover:text-gray-900 md:inline"
            >
              Ghi danh
            </Link>
            <LandingAuthCta variant="nav" />
          </div>
        </div>
      </nav>

      <main className="pt-14">{children}</main>
    </div>
  );
}
