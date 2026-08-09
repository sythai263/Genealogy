/**
 * @project AncestorTree
 * @file src/components/notifications/notifications-view.tsx
 * @description Full notifications list with mark as read and delete
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ListPagination } from '@components/shared';
import { Button, Card, CardContent } from '@components/ui';
import { LIST_DEFAULT_PAGE_SIZE, type ListPageSize } from '@constants';
import {
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useResettablePage,
  useUnreadCount,
} from '@hooks';
import { NotificationListItem } from './notification-list-item';

export function NotificationsView() {
  const router = useRouter();
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(String(pageSize));
  const { data, isLoading } = useNotifications({ page, pageSize });
  const notifications = data?.items ?? [];
  const total = data?.total ?? 0;
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  function handleOpen(id: string, link: string | null, isRead: boolean) {
    if (!isRead) {
      markAsRead.mutate(id);
    }
    if (link) {
      router.push(link);
    }
  }

  function handleDelete(event: React.MouseEvent, id: string) {
    event.stopPropagation();
    deleteNotif.mutate(id, {
      onError: () => toast.error('Lỗi khi xóa thông báo'),
    });
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Bell className="h-6 w-6" />
            Thông báo
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} chưa đọc
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <Check className="mr-1.5 h-4 w-4" />
            Đã đọc tất cả
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Chưa có thông báo nào
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="thông báo"
          />
        </div>
      )}
    </div>
  );
}
