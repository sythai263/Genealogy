/**
 * @project AncestorTree
 * @file src/components/settings/notification-broadcast-card.tsx
 * @description Admin card to broadcast a `system` notification to all members
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Bell, Loader2, Send } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@components/ui';
import { useBroadcastNotification } from '@hooks';

export function NotificationBroadcastCard() {
  const t = useTranslations('Admin');
  const broadcast = useBroadcastNotification();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t('settings.broadcast.titleRequired'));
      return;
    }
    try {
      const result = await broadcast.mutateAsync({
        title: title.trim(),
        body: body.trim() || undefined,
        link: link.trim() || undefined,
      });
      toast.success(t('settings.broadcast.success', { count: result.sent }));
      setTitle('');
      setBody('');
      setLink('');
    } catch {
      toast.error(t('settings.broadcast.error'));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          {t('settings.broadcast.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.broadcast.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('settings.broadcast.titleLabel')}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder={t('settings.broadcast.titlePlaceholder')}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('settings.broadcast.bodyLabel')}</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={t('settings.broadcast.bodyPlaceholder')}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('settings.broadcast.linkLabel')}</Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/events"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={broadcast.isPending}>
            {broadcast.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t('settings.broadcast.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
