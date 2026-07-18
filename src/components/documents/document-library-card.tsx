/**
 * @project AncestorTree
 * @file src/components/documents/document-library-card.tsx
 * @description Document card for the public library gallery
 * @version 1.0.0
 * @updated 2026-07-18
 */

import {
  Download,
  ExternalLink,
  File,
  FileText,
  Image,
  Map,
  PenLine,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Card, CardContent } from '@components/ui';
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_PRIVACY_LABELS,
  formatDocumentFileSize,
  isDocumentImageUrl,
} from '@constants';
import { cn } from '@lib/utils';
import type { ClanDocument, DocumentCategory } from '@types';

const CATEGORY_ICONS: Record<DocumentCategory, LucideIcon> = {
  anh_lich_su: Image,
  giay_to: FileText,
  ban_do: Map,
  video: Video,
  bai_viet: PenLine,
  khac: File,
};

const PRIVACY_BADGE_CLASSES: Record<0 | 1 | 2, string> = {
  0: 'bg-green-100 text-green-800',
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-red-100 text-red-800',
};

function resolvePrivacyLevel(level: number): 0 | 1 | 2 | null {
  if (level === 0 || level === 1 || level === 2) return level;
  return null;
}

interface DocumentLibraryCardProps {
  document: ClanDocument;
  personName?: string;
}

export function DocumentLibraryCard({
  document,
  personName,
}: DocumentLibraryCardProps) {
  const Icon = CATEGORY_ICONS[document.category] || File;
  const isImage = isDocumentImageUrl(document.file_url, document.file_type);
  const privacyLevel = resolvePrivacyLevel(document.privacy_level);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {isImage ? (
        <div className="h-40 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={document.file_url}
            alt={document.title}
            className="h-full w-full object-cover"
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
                className={cn('text-xs', PRIVACY_BADGE_CLASSES[privacyLevel])}
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
          <a
            href={document.file_url}
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
        </div>
      </CardContent>
    </Card>
  );
}
