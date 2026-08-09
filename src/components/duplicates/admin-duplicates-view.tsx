/**
 * @project AncestorTree
 * @file src/components/duplicates/admin-duplicates-view.tsx
 * @description Admin duplicate detection review page
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useCallback, useState } from 'react';
import { AlertTriangle, CheckCircle, Users, X } from 'lucide-react';
import { useAuth } from '@components/auth';
import { AccessDenied, ListPagination } from '@components/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@components/ui';
import { LIST_DEFAULT_PAGE_SIZE, type ListPageSize } from '@constants';
import { useDuplicates, useResettablePage } from '@hooks';
import {
  getDismissedPairs,
  pairKey,
  saveDismissedPairs,
} from '@lib';
import type { DuplicatePair } from '@types';
import { DuplicatePersonCard } from './duplicate-person-card';
import { ScoreBar } from './score-bar';

export function AdminDuplicatesView() {
  const { isEditor } = useAuth();
  const { data: duplicates, isLoading } = useDuplicates();
  const [dismissed, setDismissed] = useState<Set<string>>(() =>
    getDismissedPairs()
  );
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(String(pageSize));

  const handleDismiss = useCallback((pair: DuplicatePair) => {
    const key = pairKey(pair);
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(key);
      saveDismissedPairs(next);
      return next;
    });
  }, []);

  if (!isEditor) {
    return <AccessDenied />;
  }

  const visiblePairs = (duplicates || []).filter(
    pair => !dismissed.has(pairKey(pair))
  );
  const highCount = visiblePairs.filter(pair => pair.level === 'HIGH').length;
  const mediumCount = visiblePairs.filter(
    pair => pair.level === 'MEDIUM'
  ).length;

  // Detection runs over the full tree graph (see useDuplicates) — only the
  // rendered result list is paginated here, client-side.
  const total = visiblePairs.length;
  const pageStart = (page - 1) * pageSize;
  const pagedPairs = visiblePairs.slice(pageStart, pageStart + pageSize);

  return (
    <div className='container mx-auto px-4 py-8 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Phát hiện trùng lặp</h1>
        <p className='text-muted-foreground'>
          Phát hiện thành viên có thể bị nhập trùng
        </p>
      </div>

      {/* Summary */}
      <div className='flex gap-3 text-sm'>
        {isLoading ? (
          <Skeleton className='h-6 w-32' />
        ) : visiblePairs.length === 0 ? (
          <div className='flex items-center gap-2 text-green-600'>
            <CheckCircle className='h-4 w-4' />
            <span>Không tìm thấy cặp trùng lặp nào</span>
          </div>
        ) : (
          <>
            <Badge variant='destructive'>{highCount} nghi ngờ cao</Badge>
            <Badge
              variant='outline'
              className='bg-yellow-50 text-yellow-800 border-yellow-200'>
              {mediumCount} trung bình
            </Badge>
          </>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className='space-y-3'>
          {[1, 2, 3].map(index => (
            <Skeleton key={index} className='h-32 rounded-lg' />
          ))}
        </div>
      )}

      {/* Pairs */}
      {!isLoading && visiblePairs.length > 0 && (
        <div className='space-y-3'>
          {pagedPairs.map(pair => {
            const pct = Math.round(pair.score.total * 100);

            return (
              <Card key={pairKey(pair)} className='overflow-hidden'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          pair.level === 'HIGH' ? 'destructive' : 'outline'
                        }
                        className={
                          pair.level === 'MEDIUM'
                            ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                            : ''
                        }>
                        {pair.level === 'HIGH' ? (
                          <AlertTriangle className='h-3 w-3 mr-1' />
                        ) : null}
                        {pct}%
                      </Badge>
                      <CardTitle className='text-sm font-medium'>
                        {pair.personA.display_name} ↔{' '}
                        {pair.personB.display_name}
                      </CardTitle>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 text-xs'
                      onClick={() => handleDismiss(pair)}>
                      <X className='h-3 w-3 mr-1' />
                      Bỏ qua
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex gap-4'>
                    <DuplicatePersonCard person={pair.personA} />
                    <div className='flex items-center'>
                      <Users className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <DuplicatePersonCard person={pair.personB} />
                  </div>
                  <div className='grid grid-cols-2 sm:grid-cols-5 gap-2'>
                    <ScoreBar label='Tên' value={pair.score.name} />
                    <ScoreBar label='Cha' value={pair.score.father} />
                    <ScoreBar label='Năm sinh' value={pair.score.birthYear} />
                    <ScoreBar label='Đời' value={pair.score.generation} />
                    <ScoreBar label='Giới' value={pair.score.gender} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="cặp trùng"
          />
        </div>
      )}

      {/* Info */}
      <Card>
        <CardContent className='py-4'>
          <CardDescription className='text-xs space-y-1'>
            <p>
              <strong>Cách tính điểm:</strong> Tên (30%) + Cha (25%) + Năm sinh
              (20%) + Đời (15%) + Giới tính (10%)
            </p>
            <p>
              <strong>Ngưỡng:</strong> Cao ≥ 85%, Trung bình 60-84%. Dưới 60%
              được ẩn tự động.
            </p>
            <p>
              <strong>Loại trừ:</strong> Khác giới tính hoặc chênh năm sinh
              &gt; 10 năm.
            </p>
            <p>
              Các cặp đã &quot;Bỏ qua&quot; được lưu trên trình duyệt này. Xóa
              dữ liệu trình duyệt để hiện lại.
            </p>
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
