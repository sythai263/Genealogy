/**
 * @project AncestorTree
 * @file src/components/contributions/admin-contributions-view.tsx
 * @description Admin view to review and approve/reject contributions
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileEdit,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  QueryBoundary,
} from '@components/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@components/ui';
import {
  ACCESS_DENIED_ADMIN_MESSAGE,
  CONTRIBUTION_CHANGE_TYPE_LABELS,
  CONTRIBUTION_FIELD_OPTIONS,
  CONTRIBUTION_STATUS_CONFIG,
  getContributionFieldLabel,
  LIST_DEFAULT_PAGE_SIZE,
  type ContributionFieldKey,
  type ListPageSize,
} from '@constants';
import {
  useContributions,
  useDeleteContribution,
  usePendingContributionsCount,
  usePeopleByIds,
  useProfilesByIds,
  useResettablePage,
  useReviewContribution,
} from '@hooks';
import type { Contribution, ContributionStatus, Person } from '@types';

function isContributionFieldKey(key: string): key is ContributionFieldKey {
  return CONTRIBUTION_FIELD_OPTIONS.some((field) => field.value === key);
}

function getPersonFieldDisplayValue(person: Person, key: string): string | undefined {
  if (!isContributionFieldKey(key)) return undefined;
  const value = person[key];
  if (value === undefined || value === null) return undefined;
  return String(value);
}

export function AdminContributionsView() {
  const { profile, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [pageSize, setPageSize] = useState<ListPageSize>(
    LIST_DEFAULT_PAGE_SIZE
  );
  const [page, setPage] = useResettablePage(`${statusFilter}|${pageSize}`);

  const listStatus =
    statusFilter === 'all' ? undefined : (statusFilter as ContributionStatus);
  const { data, isLoading } = useContributions({
    status: listStatus,
    page,
    pageSize,
  });
  const { data: pendingCount = 0 } = usePendingContributionsCount();
  const reviewContribution = useReviewContribution();
  const deleteContribution = useDeleteContribution();

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [...new Set(items.map((c) => c.target_person).filter(Boolean))],
    [items]
  );
  const profileIds = useMemo(
    () => [
      ...new Set(
        items.flatMap((c) =>
          [c.author_id, c.reviewed_by].filter(
            (id): id is string => typeof id === 'string' && id.length > 0
          )
        )
      ),
    ],
    [items]
  );
  const { data: people } = usePeopleByIds(personIds);
  const { data: profiles } = useProfilesByIds(profileIds);

  if (!isAdmin) {
    return <AccessDenied description={ACCESS_DENIED_ADMIN_MESSAGE} />;
  }

  const filteredContributions = items;

  const handleDelete = async (c: Contribution) => {
    try {
      await deleteContribution.mutateAsync(c.id);
      toast.success('Đã xóa đề xuất');
    } catch {
      toast.error('Lỗi khi xóa đề xuất');
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    if (!profile) return;
    try {
      await reviewContribution.mutateAsync({
        id,
        status,
        reviewerId: profile.id,
        reviewNotes: reviewNotes[id],
      });
      toast.success(status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối');
      setReviewNotes(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      toast.error('Lỗi khi xử lý đề xuất');
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <Button variant='ghost' asChild className='mb-4 -ml-2'>
          <Link href='/admin'>
            <ArrowLeft className='mr-2 h-4 w-4' /> Quản trị
          </Link>
        </Button>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50'>
            <ClipboardList className='h-5 w-5 text-purple-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Duyệt đề xuất chỉnh sửa</h1>
            <p className='text-muted-foreground'>
              {pendingCount > 0
                ? `${pendingCount} đề xuất đang chờ duyệt`
                : 'Không có đề xuất chờ duyệt'}
            </p>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-4 mb-6'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-45'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='pending'>Chờ duyệt ({pendingCount})</SelectItem>
            <SelectItem value='approved'>Đã duyệt</SelectItem>
            <SelectItem value='rejected'>Đã từ chối</SelectItem>
            <SelectItem value='all'>Tất cả</SelectItem>
          </SelectContent>
        </Select>
        <CardDescription>
          {isLoading ? 'Đang tải...' : `${total} đề xuất`}
        </CardDescription>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={filteredContributions.length === 0}
        emptyIcon={ClipboardList}
        emptyTitle={
          statusFilter === 'pending'
            ? 'Không có đề xuất chờ duyệt'
            : 'Không có đề xuất nào'
        }
        skeletonRows={3}>
        <div className='space-y-4'>
          {filteredContributions.map(c => {
            const person = people?.find(p => p.id === c.target_person);
            const author = profiles?.find(p => p.id === c.author_id);
            const reviewer = c.reviewed_by
              ? profiles?.find(p => p.id === c.reviewed_by)
              : undefined;
            const statusInfo = CONTRIBUTION_STATUS_CONFIG[c.status];

            return (
              <Card key={c.id}>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <Badge
                        variant={
                          c.status === 'pending'
                            ? 'default'
                            : c.status === 'approved'
                              ? 'secondary'
                              : 'destructive'
                        }>
                        {statusInfo.label}
                      </Badge>
                      <Badge variant='outline'>
                        {CONTRIBUTION_CHANGE_TYPE_LABELS[c.change_type]}
                      </Badge>
                    </div>
                    <div className='flex items-center gap-2 shrink-0'>
                      <span className='text-xs text-muted-foreground'>
                        {new Date(c.created_at).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7 text-muted-foreground hover:text-destructive'>
                            <Trash2 className='h-3.5 w-3.5' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa đề xuất?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Xóa vĩnh viễn đề xuất này. Hành động không thể
                              hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              className='bg-destructive hover:bg-destructive/90'
                              onClick={() => handleDelete(c)}>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className='text-base mt-2'>
                    {person ? (
                      <Link
                        href={`/people/${person.id}`}
                        className='hover:underline'>
                        {person.display_name}
                      </Link>
                    ) : (
                      'Thành viên không xác định'
                    )}
                  </CardTitle>
                  {author && (
                    <CardDescription className='flex items-center gap-1'>
                      <User className='h-3 w-3' />
                      Đề xuất bởi: {author.full_name || author.email}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Changes diff */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-1 text-sm font-medium text-muted-foreground'>
                      <FileEdit className='h-3.5 w-3.5' /> Thay đổi đề xuất
                    </div>
                    <div className='bg-muted rounded-lg p-3 space-y-1'>
                      {Object.entries(c.changes).map(([key, val]) => {
                        const currentValue = person
                          ? getPersonFieldDisplayValue(person, key)
                          : undefined;

                        return (
                          <div
                            key={key}
                            className='flex items-center gap-2 text-sm'>
                            <span className='font-medium min-w-30'>
                              {getContributionFieldLabel(key)}:
                            </span>
                            <span className='text-green-700 bg-green-50 px-2 py-0.5 rounded'>
                              {String(val)}
                            </span>
                            {currentValue !== undefined && (
                              <span className='text-muted-foreground text-xs'>
                                (hiện tại: {currentValue})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {c.reason && (
                    <div className='text-sm'>
                      <span className='font-medium'>Lý do: </span>
                      <span className='text-muted-foreground'>{c.reason}</span>
                    </div>
                  )}

                  {/* Review section */}
                  {c.status === 'pending' && (
                    <div className='border-t pt-4 space-y-3'>
                      <Textarea
                        placeholder='Ghi chú duyệt (tùy chọn)...'
                        value={reviewNotes[c.id] || ''}
                        onChange={e =>
                          setReviewNotes(prev => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                      <div className='flex gap-2'>
                        <Button
                          onClick={() => handleReview(c.id, 'approved')}
                          disabled={reviewContribution.isPending}
                          className='gap-2 bg-green-600 hover:bg-green-700'>
                          <CheckCircle2 className='h-4 w-4' /> Phê duyệt
                        </Button>
                        <Button
                          variant='destructive'
                          onClick={() => handleReview(c.id, 'rejected')}
                          disabled={reviewContribution.isPending}
                          className='gap-2'>
                          <XCircle className='h-4 w-4' /> Từ chối
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Review result */}
                  {c.status !== 'pending' && (
                    <div className='border-t pt-3 text-sm text-muted-foreground'>
                      {reviewer && (
                        <span>
                          Duyệt bởi: {reviewer.full_name || reviewer.email}
                        </span>
                      )}
                      {c.reviewed_at && (
                        <span>
                          {' '}
                          ·{' '}
                          {new Date(c.reviewed_at).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                      {c.review_notes && (
                        <p className='mt-1'>Ghi chú: {c.review_notes}</p>
                      )}
                    </div>
                  )}
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
            itemLabel='đề xuất'
          />
        </div>
      </QueryBoundary>
    </div>
  );
}
