/**
 * @project AncestorTree
 * @file src/constants/api.ts
 * @description Shared API status codes, error messages and MIME lookups
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const API_STATUS = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  payloadTooLarge: 413,
  unsupportedMediaType: 415,
  tooManyRequests: 429,
  serverError: 500,
  notImplemented: 501,
} as const;

export const API_ERROR_MESSAGES = {
  badRequest: 'Yêu cầu không hợp lệ',
  unauthorized: 'Bạn cần đăng nhập để thực hiện thao tác này',
  forbidden: 'Bạn không có quyền thực hiện thao tác này',
  notFound: 'Không tìm thấy dữ liệu',
  desktopOnly: 'Chức năng này chỉ khả dụng trên bản Desktop',
  webOnly: 'Chức năng này không khả dụng trên bản Desktop',
  serverMisconfigured: 'Máy chủ chưa được cấu hình đúng',
  serverError: 'Đã xảy ra lỗi, vui lòng thử lại',
  noFile: 'Không tìm thấy file',
  fileTooLarge: 'File quá lớn',
  unsupportedFileType: 'Định dạng file không được hỗ trợ',
  backupFailed: 'Sao lưu thất bại',
  restoreFailed: 'Khôi phục thất bại',
  exportFailed: 'Xuất dữ liệu thất bại',
  notImplemented: 'Chức năng này chưa được triển khai',
} as const;

/** Extension → Content-Type map for locally served desktop media */
export const MEDIA_EXT_MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

export const MEDIA_FALLBACK_MIME_TYPE = 'application/octet-stream';

/** Roles allowed to run privileged export/admin API operations */
export const API_ADMIN_ROLES = ['admin', 'editor'] as const;
