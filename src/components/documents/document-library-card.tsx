/**
 * @project AncestorTree
 * @file src/components/documents/document-library-card.tsx
 * @description Document card for the public library gallery
 * @version 1.0.0
 * @updated 2026-07-18
 */

import Image from 'next/image';
import { Download, ExternalLink, File } from 'lucide-react';
import { Badge, Card, CardContent } from '@components/ui';
import {
  DOCUMENT_CATEGORY_ICONS,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_PRIVACY_BADGE_CLASSES,
  DOCUMENT_PRIVACY_LABELS,
  formatDocumentFileSize,
  isDocumentImageUrl,
} from '@constants';
import { cn } from '@lib';
import type { ClanDocument } from '@types';

function resolvePrivacyLevel(level: number): 0 | 1 | 2 | null {
  if (level === 0 || level === 1 || level === 2) return level;
  return null;
}

interface DocumentLibraryCardProps {
  document: ClanDocument;
  personName?: string;
  /** Resolved signed URL; undefined while loading or when access is denied */
  fileUrl?: string;
}

export function DocumentLibraryCard({
  document,
  personName,
  fileUrl,
}: DocumentLibraryCardProps) {
  const Icon = DOCUMENT_CATEGORY_ICONS[document.category] || File;
  const isImage = isDocumentImageUrl(document.file_url, document.file_type);
  const privacyLevel = resolvePrivacyLevel(document.privacy_level);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {isImage && fileUrl ? (
        <div className="relative h-40 overflow-hidden bg-muted">
          <Image
            src={fileUrl}
            alt={document.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex h-28 items-center justify-center bg-muted/50">
          <Icon className="h-10 w-10 text-muted-foreground/40" />
        </div>
      )}

      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-medium">{document.title}</h3>
          <div className="flex shrink-0 gap-1">
            <Badge variant="outline" className="text-xs">
              {DOCUMENT_CATEGORY_LABELS[document.category]}
            </Badge>
            {privacyLevel !== null && (
              <Badge
                className={cn('text-xs', DOCUMENT_PRIVACY_BADGE_CLASSES[privacyLevel])}
              >
                {DOCUMENT_PRIVACY_LABELS[privacyLevel]}
              </Badge>
            )}
          </div>
        </div>

        {document.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {document.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {personName && <span>{personName}</span>}
            {document.file_size ? (
              <span>{formatDocumentFileSize(document.file_size)}</span>
            ) : null}
          </div>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
            >
              {isImage ? (
                <ExternalLink className="h-3 w-3" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              {isImage ? 'Xem' : 'Tải'}
            </a>
          ) : (
            <span className="text-muted-foreground/60">Đang mở khoá…</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
