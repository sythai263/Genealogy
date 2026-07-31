/**
 * @project AncestorTree
 * @file src/components/documents/document-hub-link-card.tsx
 * @description Navigation card for documents hub links
 * @version 1.0.0
 * @updated 2026-07-18
 */

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { cn } from '@lib';
import {
  DOCUMENT_HUB_ICON_TONE_CLASSES,
  type DocumentsHubLinkConfig,
} from '@constants';

interface DocumentHubLinkCardProps {
  config: DocumentsHubLinkConfig;
  icon: LucideIcon;
}

export function DocumentHubLinkCard({
  config,
  icon: Icon,
}: DocumentHubLinkCardProps) {
  const tone = DOCUMENT_HUB_ICON_TONE_CLASSES[config.iconTone];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              tone.wrap
            )}
          >
            <Icon className={cn('h-5 w-5', tone.icon)} />
          </div>
          <div>
            <CardTitle>{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{config.body}</p>
        <Button asChild variant="outline" className="w-full">
          <Link href={config.href}>
            <Icon className="mr-2 h-4 w-4" />
            {config.actionLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
