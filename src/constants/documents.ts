/**
 * @project AncestorTree
 * @file src/constants/documents.ts
 * @description Shared constants for documents hub
 * @version 1.0.0
 * @updated 2026-07-18
 */

export const DOCUMENTS_PRIVATE_PRIVACY_LEVEL = 2;

export interface DocumentsHubLinkConfig {
  id: 'book' | 'library';
  href: string;
  title: string;
  description: string;
  body: string;
  actionLabel: string;
  iconTone: 'purple' | 'amber';
}

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
