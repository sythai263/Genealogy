/**
 * @project AncestorTree
 * @file src/components/documents/book-view.tsx
 * @description Printable family chronicle book view
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Separator,
  Skeleton,
} from '@components/ui';
import { BOOK_MOTTO } from '@constants';
import { useClanSettings, useTreeData } from '@hooks';
import { CLAN_FULL_NAME, generateBookData } from '@lib';
import { BookChapterSection } from './book-chapter-section';

export function BookView() {
  const { data: treeData, isLoading, error } = useTreeData();
  const { data: clanSettings } = useClanSettings();
  const clanFullName = clanSettings?.clan_full_name ?? CLAN_FULL_NAME;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !treeData) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-destructive">
              {error ? `Lỗi: ${error.message}` : 'Không có dữ liệu'}
            </p>
            <Button asChild variant="outline">
              <Link href="/documents">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chapters = generateBookData(treeData);
  const totalPeople = chapters.reduce(
    (sum, chapter) =>
      sum +
      chapter.branches.reduce(
        (branchSum, branch) => branchSum + branch.people.length,
        0
      ),
    0
  );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="no-print mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tài liệu
          </Link>
        </Button>
        <Button onClick={() => window.print()} size="sm">
          <Printer className="mr-2 h-4 w-4" />
          In / Lưu PDF
        </Button>
      </div>

      <div className="book-content space-y-8">
        <div className="book-cover border-b-2 border-emerald-600 py-12 text-center">
          <h1 className="mb-2 text-3xl font-bold text-emerald-900 md:text-4xl">
            Gia Phả
          </h1>
          <h2 className="mb-4 text-xl font-semibold text-emerald-700 md:text-2xl">
            {clanFullName}
          </h2>
          <p className="mb-6 text-muted-foreground italic">
            &ldquo;{BOOK_MOTTO}&rdquo;
          </p>
          <Separator className="mx-auto max-w-xs" />
          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p>
              {totalPeople} thành viên · {chapters.length} đời
            </p>
            <p>Xuất bản: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        <div className="book-toc">
          <h2 className="mb-3 text-lg font-bold">Mục lục</h2>
          <div className="space-y-1">
            {chapters.map((chapter) => {
              const count = chapter.branches.reduce(
                (sum, branch) => sum + branch.people.length,
                0
              );
              return (
                <div
                  key={chapter.generation}
                  className="flex justify-between border-b border-dotted pb-1 text-sm"
                >
                  <span>{chapter.title}</span>
                  <span className="text-muted-foreground">{count} người</span>
                </div>
              );
            })}
          </div>
        </div>

        {chapters.map((chapter) => (
          <BookChapterSection
            key={chapter.generation}
            chapter={chapter}
          />
        ))}

        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>Gia Phả Điện Tử - {clanFullName}</p>
          <p>
            Được tạo bởi AncestorTree · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
