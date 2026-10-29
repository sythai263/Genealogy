/**
 * @project AncestorTree
 * @file src/app/ping/page.tsx
 * @description Keep-alive page — upserts the singleton keep_alive row so the
 *              Supabase free-tier project registers activity and is not paused,
 *              then shows the ping timestamp. Safe for external monitors
 *              (200 on success, error page on failure); machine crons should
 *              use /api/ping instead (tiny JSON body).
 * @version 1.0.0
 * @updated 2026-10-13
 */

import { Card, CardContent } from '@components/ui';
import { pingKeepAlive } from '@lib/api';
import { Activity } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ping',
  robots: { index: false, follow: false },
};

export default async function PingPage() {
  const { pinged_at: pingedAt } = await pingKeepAlive();

  const displayTime = new Date(pingedAt).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
  });

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="py-10 text-center">
        <Activity className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="mb-1 text-lg font-semibold">pong</h1>
        <p className="text-sm text-muted-foreground">Supabase keep-alive</p>
        <time
          dateTime={pingedAt}
          className="mt-4 block text-base font-medium"
        >
          {displayTime}
        </time>
        <p className="mt-1 text-xs text-muted-foreground">{pingedAt}</p>
      </CardContent>
    </Card>
  );
}
