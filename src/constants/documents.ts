/**
 * @project AncestorTree
 * @file src/constants/documents.ts
 * @description Shared constants for documents hub, library, and book
 * @version 1.1.0
 * @updated 2026-07-18
 */

import {
  Archive,
  BookOpen,
  File,
  FileText,
  Image,
  Map,
  PenLine,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { DocumentCategory } from '@types';

export const DOCUMENTS_PRIVATE_PRIVACY_LEVEL = 2;

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  anh_lich_su: 'Ảnh lịch sử',
  giay_to: 'Giấy tờ',
  ban_do: 'Bản đồ',
  video: 'Video',
  bai_viet: 'Bài viết',
  khac: 'Khác',
};

export const DOCUMENT_CATEGORY_ORDER: DocumentCategory[] = [
  'anh_lich_su',
  'giay_to',
  'ban_do',
  'video',
  'bai_viet',
  'khac',
];

export const DOCUMENT_PRIVACY_LABELS: Record<0 | 1 | 2, string> = {
  0: 'Công khai',
  1: 'Thành viên',
  2: 'Nội bộ',
};

export const BOOK_MOTTO = 'Gìn giữ tinh hoa - Tiếp bước cha ông';

export interface DocumentsHubLinkConfig {
  id: 'book' | 'library';
  href: string;
  title: string;
  description: string;
  body: string;
  actionLabel: string;
  iconTone: 'purple' | 'amber';
}

export const DOCUMENT_CATEGORY_OPTIONS = DOCUMENT_CATEGORY_ORDER.map(
  (value) => ({
    value,
    label: DOCUMENT_CATEGORY_LABELS[value],
  })
);

export const DOCUMENT_CATEGORY_ICONS: Record<DocumentCategory, LucideIcon> = {
  anh_lich_su: Image,
  giay_to: FileText,
  ban_do: Map,
  video: Video,
  bai_viet: PenLine,
  khac: File,
};

export const DOCUMENT_PRIVACY_BADGE_CLASSES: Record<0 | 1 | 2, string> = {
  0: 'bg-green-100 text-green-800',
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-red-100 text-red-800',
};

export const DOCUMENT_HUB_ICON_TONE_CLASSES: Record<
  DocumentsHubLinkConfig['iconTone'],
  { wrap: string; icon: string }
> = {
  purple: { wrap: 'bg-purple-50', icon: 'text-purple-600' },
  amber: { wrap: 'bg-amber-50', icon: 'text-amber-600' },
};

export const DOCUMENTS_HUB_LINK_ICONS: Record<
  DocumentsHubLinkConfig['id'],
  LucideIcon
> = {
  book: BookOpen,
  library: Archive,
};

export const DOCUMENTS_HUB_LINKS: DocumentsHubLinkConfig[] = [
  {
    id: 'book',
    href: '/documents/book',
    title: 'Gia Phả Sách',
    description: 'Xem và in gia phả dạng sách truyền thống',
    body: 'Trình bày gia phả theo từng đời, từng chi với đầy đủ thông tin thành viên. Hỗ trợ in trực tiếp hoặc lưu PDF.',
    actionLabel: 'Xem Gia Phả Sách',
    iconTone: 'purple',
  },
  {
    id: 'library',
    href: '/documents/library',
    title: 'Kho tài liệu',
    description: 'Lưu trữ ảnh lịch sử, giấy tờ, bản đồ, video',
    body: 'Kho lưu giữ ký ức dòng họ: ảnh cũ, gia phả giấy đã số hóa, bản đồ làng, video lễ hội, bài viết lịch sử.',
    actionLabel: 'Xem Kho tài liệu',
    iconTone: 'amber',
  },
];

export function isDocumentCategory(value: string): value is DocumentCategory {
  for (const category of DOCUMENT_CATEGORY_ORDER) {
    if (category === value) return true;
  }
  return false;
}

export function formatDocumentFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isDocumentImageUrl(url: string, fileType?: string): boolean {
  if (fileType?.startsWith('image/')) return true;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}
