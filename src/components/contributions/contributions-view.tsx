/**
 * @project AncestorTree
 * @file src/components/contributions/contributions-view.tsx
 * @description Member contributions list and create dialog
 * @version 1.0.0
 * @updated 2026-07-27
 */

'use client';

import { useMemo, useState } from 'react';
import { useResettablePage } from '@hooks';
import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  EmptyState,
  ListPagination,
  PageHeader,
  QueryBoundary,
} from '@components/shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import { useContributions, usePeopleByIds } from '@hooks';
import { ContributionForm } from './contribution-form';
import { ContributionListItem } from './contribution-list-item';

export function ContributionsView() {
  const { user, profile, isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const authorId = isAdmin ? undefined : profile?.id;
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(`${authorId}|${pageSize}`);
  const { data, isLoading } = useContributions(
    {
      authorId,
      page,
      pageSize,
    },
    { enabled: isAdmin || !!profile }
  );
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [...new Set(items.map((c) => c.target_person).filter(Boolean))],
    [items]
  );
  const { data: people } = usePeopleByIds(personIds);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={ClipboardList}
          title="Vui lòng đăng nhập để gửi đề xuất chỉnh sửa"
          action={
            <Button asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        className="mb-8"
        icon={ClipboardList}
        title="Đề xuất chỉnh sửa"
        description="Gửi yêu cầu cập nhật thông tin thành viên"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Đề xuất mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Đề xuất chỉnh sửa</DialogTitle>
                <DialogDescription>
                  Gửi yêu cầu cập nhật thông tin. Quản trị viên sẽ xem xét và phê
                  duyệt.
                </DialogDescription>
              </DialogHeader>
              <ContributionForm onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>
            {isLoading ? 'Đang tải...' : `${total} đề xuất`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryBoundary
            isLoading={isLoading}
            isEmpty={items.length === 0}
            emptyIcon={ClipboardList}
            emptyTitle="Bạn chưa có đề xuất nào"
            skeletonRows={3}
            surface="plain"
          >
            <div className="space-y-4">
              <div className="space-y-3">
                {items.map((contribution) => {
                  const person = people?.find(
                    (item) => item.id === contribution.target_person
                  );
                  return (
                    <ContributionListItem
                      key={contribution.id}
                      contribution={contribution}
                      person={person}
                    />
                  );
                })}
              </div>
              <ListPagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="đề xuất"
              />
            </div>
          </QueryBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
