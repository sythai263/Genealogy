/**
 * @project AncestorTree
 * @file src/components/tree/interactive-tree-section.tsx
 * @description Interactive family tree with legend and zoom guidance
 * @version 1.1.0
 * @updated 2026-07-19
 */

'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Skeleton,
} from '@components/ui';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FamilyTree = dynamic(
  () =>
    import('./family-tree').then((mod) => ({ default: mod.FamilyTree })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[60vh] w-full rounded-lg" />,
  }
);

export function InteractiveTreeSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hướng dẫn</CardTitle>
        <CardDescription className="space-y-1">
          <span className="block sm:inline">
            • <span className="text-blue-500">Viền xanh</span> = Nam •{' '}
            <span className="text-pink-500">Viền hồng</span> = Nữ
          </span>
          <span className="block sm:inline">
            • <span className="text-pink-400">Đường hồng</span> = Vợ chồng • † =
            Đã mất
          </span>
          <span className="mt-1 block text-xs">
            Trên mobile: kéo để di chuyển, dùng nút +/- để zoom
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={<Skeleton className="h-[60vh] w-full rounded-lg" />}
        >
          <FamilyTree />
        </Suspense>
      </CardContent>
    </Card>
  );
}
