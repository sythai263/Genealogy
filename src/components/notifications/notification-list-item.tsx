/**
 * @project AncestorTree
 * @file src/components/notifications/notification-list-item.tsx
 * @description Single notification row in the full notifications list
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
} from '@components/ui';
import {
  NOTIFICATION_FALLBACK_ICON,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
} from '@constants';
import { getRelativeTime } from '@lib';
import { cn } from '@lib';
import type { Notification } from '@types';

interface NotificationListItemProps {
  notification: Notification;
  onOpen: (id: string, link: string | null, isRead: boolean) => void;
  onDelete: (event: React.MouseEvent, id: string) => void;
}

export function NotificationListItem({
  notification,
  onOpen,
  onDelete,
}: NotificationListItemProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/50',
        !notification.is_read &&
          'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
      )}
      onClick={() =>
        onOpen(notification.id, notification.link, notification.is_read)
      }
    >
      <CardHeader className="px-4 pt-3 pb-1">
        <div className="flex items-start gap-3">
          <span className="shrink-0 text-lg">
            {NOTIFICATION_TYPE_ICONS[notification.type] ||
              NOTIFICATION_FALLBACK_ICON}
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle
              className={cn(
                'text-sm',
                !notification.is_read
                  ? 'font-semibold'
                  : 'font-normal text-muted-foreground'
              )}
            >
              {notification.title}
            </CardTitle>
            {notification.body && (
              <p
                className={cn(
                  'mt-0.5 text-sm',
                  notification.is_read && 'text-muted-foreground'
                )}
              >
                {notification.body}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                {getRelativeTime(notification.created_at)}
              </span>
              <Badge variant="outline" className="px-1 py-0 text-[9px]">
                {NOTIFICATION_TYPE_LABELS[notification.type] ||
                  notification.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!notification.is_read && (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={(event) => onDelete(event, notification.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
