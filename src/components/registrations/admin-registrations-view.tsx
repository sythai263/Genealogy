/**
 * @project AncestorTree
 * @file src/components/registrations/admin-registrations-view.tsx
 * @description Admin view to review member registration requests
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, ClipboardList, Loader2, Search, Trash2, X } from 'lucide-react';
import { useAuth } from '@components/auth';
import { ListPagination } from '@components/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  REGISTRATION_DEFAULT_STATUS_FILTER,
  REGISTRATION_STATUS_FILTER_ALL,
  REGISTRATION_STATUS_FILTER_OPTIONS,
  REGISTRATION_STATUS_MAP,
  type ListPageSize,
} from '@constants';
import {
  useApproveRegistration,
  useDeleteRegistration,
  useRegistrations,
  useRejectRegistration,
  useResettablePage,
} from '@hooks';
import { getRelativeTime } from '@lib';
import type { MemberRegistration } from '@types';

export function AdminRegistrationsView() {
  const { isEditor, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState(
    REGISTRATION_DEFAULT_STATUS_FILTER
  );
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(
    `${statusFilter}|${search}|${pageSize}`
  );

  const { data, isLoading } = useRegistrations({
    status:
      statusFilter === REGISTRATION_STATUS_FILTER_ALL
        ? undefined
        : statusFilter,
    search: search || undefined,
    page,
    pageSize,
  });
  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();
  const deleteMutation = useDeleteRegistration();

  const [rejectTarget, setRejectTarget] = useState<MemberRegistration | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MemberRegistration | null>(
    null
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  if (!isEditor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Bạn cần quyền biên tập viên để truy cập trang này
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin">Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleApprove(reg: MemberRegistration) {
    try {
      await approveMutation.mutateAsync({ id: reg.id });
      toast.success(`Đã duyệt ${reg.full_name}`);
    } catch {
      toast.error('Lỗi khi duyệt');
    }
  }

  async function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({
        id: rejectTarget.id,
        reason: rejectReason,
      });
      toast.success(`Đã từ chối ${rejectTarget.full_name}`);
      setRejectTarget(null);
      setRejectReason('');
    } catch {
      toast.error('Lỗi khi từ chối');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Đã xóa đơn đăng ký');
      setDeleteTarget(null);
    } catch {
      toast.error('Lỗi khi xóa');
    }
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardList className="h-6 w-6" />
          Đơn đăng ký thành viên
        </h1>
        <p className="text-muted-foreground">
          Xét duyệt đơn ghi danh từ con cháu sống xa
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGISTRATION_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {statusFilter === 'pending'
              ? 'Không có đơn chờ duyệt'
              : 'Không có kết quả'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map((reg) => (
              <Card key={reg.id}>
                <CardHeader className="px-4 pt-3 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{reg.full_name}</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {reg.gender === 1 ? 'Nam' : 'Nữ'}
                        {reg.birth_year && ` · Sinh ${reg.birth_year}`}
                        {reg.birth_place && ` · ${reg.birth_place}`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        REGISTRATION_STATUS_MAP[reg.status]?.variant ??
                        'outline'
                      }
                    >
                      {REGISTRATION_STATUS_MAP[reg.status]?.label ??
                        reg.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-3">
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    {reg.parent_name && (
                      <div>
                        <span className="text-muted-foreground">Cha/mẹ: </span>
                        {reg.parent_name}
                      </div>
                    )}
                    {reg.generation && (
                      <div>
                        <span className="text-muted-foreground">Đời: </span>
                        {reg.generation}
                      </div>
                    )}
                    {reg.chi && (
                      <div>
                        <span className="text-muted-foreground">Chi: </span>
                        {reg.chi}
                      </div>
                    )}
                    {reg.relationship && (
                      <div>
                        <span className="text-muted-foreground">Quan hệ: </span>
                        {reg.relationship}
                      </div>
                    )}
                    {reg.phone && (
                      <div>
                        <span className="text-muted-foreground">SĐT: </span>
                        {reg.phone}
                      </div>
                    )}
                    {reg.email && (
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        {reg.email}
                      </div>
                    )}
                  </div>
                  {reg.notes && (
                    <p className="border-t pt-2 text-xs text-muted-foreground">
                      {reg.notes}
                    </p>
                  )}
                  {reg.reject_reason && (
                    <p className="border-t pt-2 text-xs text-red-500">
                      Lý do từ chối: {reg.reject_reason}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {getRelativeTime(reg.created_at)}
                    </span>
                    <div className="flex gap-1.5">
                      {reg.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs"
                            onClick={() => void handleApprove(reg)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setRejectTarget(reg);
                              setRejectReason('');
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(reg)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="đơn"
          />
        </div>
      )}

      <AlertDialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối đơn đăng ký</AlertDialogTitle>
            <AlertDialogDescription>
              Từ chối đơn của <strong>{rejectTarget?.full_name}</strong>. Vui
              lòng ghi lý do.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Lý do từ chối..."
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleReject()}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đơn đăng ký?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa vĩnh viễn đơn của <strong>{deleteTarget?.full_name}</strong>.
              Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
