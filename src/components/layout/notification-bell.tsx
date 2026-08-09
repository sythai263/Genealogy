/**
 * @project AncestorTree
 * @file src/components/layout/notification-bell.tsx
 * @description Bell icon with unread badge + dropdown list of notifications
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@components/auth';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui';
import {
  NOTIFICATION_FALLBACK_ICON,
  NOTIFICATION_TYPE_ICONS,
} from '@constants';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useRecentNotifications,
  useUnreadCount,
} from '@hooks';
import { getRelativeTime } from '@lib';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
  const t = useTranslations('Notifications');
  const { user } = useAuth();
  const router = useRouter();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notifications, isLoading } = useRecentNotifications(10);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  if (!user) return null;

  const handleClickNotification = (
    id: string,
    link: string | null,
    isRead: boolean
  ) => {
    if (!isRead) {
      markAsRead.mutate(id);
    }
    if (link) {
      router.push(link);
    }
  };

  const recent = (notifications || []).slice(0, 10);
  const ariaLabel =
    unreadCount > 0
      ? `${t('bell.ariaLabel')} (${t('bell.unread', { count: unreadCount })})`
      : t('bell.ariaLabel');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-full p-2 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={ariaLabel}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{t('title')}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="mr-1 h-3 w-3" />
              {t('markAllRead')}
            </Button>
          )}
        </div>

        <div className="max-h-90 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : recent.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('empty')}
            </div>
          ) : (
            recent.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClickNotification(n.id, n.link, n.is_read)}
                className={`w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent ${
                  !n.is_read ? 'bg-accent/40' : ''
                }`}
              >
                <div className="flex gap-2.5">
                  <span className="mt-0.5 shrink-0 text-base">
                    {NOTIFICATION_TYPE_ICONS[n.type] ||
                      NOTIFICATION_FALLBACK_ICON}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${!n.is_read ? 'font-medium' : 'text-muted-foreground'}`}
                    >
                      {n.body || n.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {getRelativeTime(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {(notifications || []).length > 0 && (
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => router.push('/notifications')}
            >
              {t('viewAll')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
