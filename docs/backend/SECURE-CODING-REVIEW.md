---
project: AncestorTree
path: docs/backend/SECURE-CODING-REVIEW.md
type: security-report
version: 1.1.0
updated: 2026-09-16
owner: team
status: approved
---

# Secure Coding Review — AncestorTree v2.2.0

> **Phương pháp:** OWASP Top 10 + OWASP ASVS Level 1
> **Phạm vi:** Next.js API routes, Supabase data layer, SQLite desktop shim, middleware auth

---

## 🔄 Cập nhật trạng thái (2026-09 codebase audit)

Đối chiếu lại với code hiện tại — nhiều findings đã **được vá** hoặc
**obsolete** cùng desktop code:

| Finding | Trạng thái 2026-09 |
|---------|---------------------|
| SC-GOOD-02 path traversal (`/api/media/[...path]`) | ⏹️ Obsolete — route đã xóa cùng desktop |
| SC-GOOD-05/06 SQLite shim, desktop guards | ⏹️ Obsolete — desktop đã gỡ |
| SEC-CRIT-01 file size limit | ✅ **Fixed** — `MEDIA_STORAGE_MAX_FILE_SIZE` (5MB) + `validateUpload()` trong `lib/api/files.ts`; backup import limit 500MB |
| SEC-CRIT-02 MIME validation | ✅ **Fixed** — `MEDIA_STORAGE_ALLOWED_TYPES` check trong `supabase-storage.ts:32`; GEDCOM import limit 10MB |
| SEC-CRIT-03 import manifest validation | ⚠️ Partial — manifest parse có, nhưng restore trả 501 nên column allowlist chưa cần thiết (file header vẫn ghi ý định) |
| SEC-WARN-01 column injection (query-builder) | ⏹️ Obsolete — desktop query-builder đã xóa |
| SEC-WARN-02 `deleteDocumentFile` path extraction | 🔍 Cần re-check `src/lib/supabase-data-documents.ts` |
| SEC-WARN-03 rate limiting | ✅ **Fixed** — `src/proxy.ts` in-memory rate limit trên auth routes + `lib/login-lockout.ts` backoff |
| SEC-WARN-04 import size limit | ✅ **Fixed** — `BACKUP_MAX_IMPORT_SIZE` = 500MB |

**Findings vẫn mở** (từ `docs/security/AUDIT_PLAN.md` — audit mới hơn):
`/api/backup` luôn 500 (P0), restore 501 (P0), thiếu CSP/HSTS, `.env.example`,
health-check, CI pipeline.

---

## TÓM TẮT (TOON)

```
✅ PASS (6 kiểm soát tốt)
⚠️  WARN (4 rủi ro trung bình)
❌ FAIL (3 lỗ hổng cần vá)
```

---

## ✅ Kiểm soát Bảo mật Tốt

### SC-GOOD-01 — RLS (Row Level Security) trên tất cả bảng
- Tất cả 14 bảng đều bật RLS
- 4 tầng phân quyền: anonymous → viewer → editor → admin
- Security hardening migration (SEC-01 đến SEC-06) đã vá các lỗ hổng ban đầu

### SC-GOOD-02 — Path Traversal Protection trong Media API
```typescript
// src/app/api/media/[...path]/route.ts:35-41
function resolveSafePath(segments: string[]): string | null {
  const resolved = path.resolve(MEDIA_ROOT, ...segments);
  if (!resolved.startsWith(MEDIA_ROOT + path.sep) && resolved !== MEDIA_ROOT) {
    return null; // → 403 Forbidden
  }
  return resolved;
}
```
**Đánh giá:** Đúng kỹ thuật, dùng `path.resolve()` + prefix check.

### SC-GOOD-03 — LIKE Injection Prevention
```typescript
// src/lib/supabase-data.ts:105-106
const escaped = query.replace(/[%_\\]/g, '\\$&');
```
**Đánh giá:** Escape đúng 3 ký tự đặc biệt của LIKE pattern.

### SC-GOOD-04 — Mass Assignment Protection trong Contribution Review
```typescript
// src/lib/supabase-data.ts:698-708
const allowedFields = ['display_name', 'first_name', ...];
const safeChanges: Record<string, unknown> = {};
for (const [key, val] of Object.entries(contribution.changes)) {
  if (allowedFields.includes(key)) safeChanges[key] = val;
}
```
**Đánh giá:** Whitelist rõ ràng, không cho phép mass assignment.

### SC-GOOD-05 — Parameterized Queries trong SQLite
```typescript
// query-builder.ts — tất cả queries đều dùng ? placeholder
const sql = `INSERT INTO "${table}" (...) VALUES (${placeholders})`;
db.run(sql, values); // values truyền riêng, không nối string
```
**Đánh giá:** Tốt. Giá trị không bao giờ nối trực tiếp vào SQL.

### SC-GOOD-06 — Desktop-only Guards
```typescript
function isDesktopMode(): boolean {
  return process.env.NEXT_PUBLIC_DESKTOP_MODE === 'true' ||
    process.env.DESKTOP_MODE === 'true';
}
// → 404 nếu không phải desktop mode
```
**Đánh giá:** Mọi internal API đều có guard, web mode không bị ảnh hưởng.

---

## ❌ Lỗ hổng Cần Vá

### SEC-CRIT-01 — Thiếu file size limit trên Upload (OWASP A05: Security Misconfiguration)

**File:** [src/app/api/media/[...path]/route.ts:100-108](src/app/api/media/%5B...path%5D/route.ts#L100)

**Vấn đề:**
```typescript
// Hiện tại — KHÔNG có giới hạn kích thước
const arrayBuffer = await file.arrayBuffer(); // có thể là 10GB+
fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
```

**Rủi ro:** DoS bằng cách upload file cực lớn, lấp đầy ổ đĩa.

**Fix:**
```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 413 });
}
```

---

### SEC-CRIT-02 — Thiếu MIME type validation trên Upload (OWASP A03: Injection)

**File:** [src/app/api/media/[...path]/route.ts](src/app/api/media/%5B...path%5D/route.ts)

**Vấn đề:** Chỉ check extension khi GET (MIME map), nhưng POST không validate nội dung thực sự của file. Attacker có thể upload file PHP/EXE đổi tên thành `.jpg`.

**Fix:**
```typescript
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'video/mp4',
]);

if (!ALLOWED_MIME_TYPES.has(file.type)) {
  return NextResponse.json({ error: 'File type not allowed' }, { status: 415 });
}
```

---

### SEC-CRIT-03 — Import không validate schema manifest (OWASP A08: Software and Data Integrity)

**File:** [src/app/api/desktop-import/route.ts:61-63](src/app/api/desktop-import/route.ts#L61)

**Vấn đề:**
```typescript
const manifest = JSON.parse(manifestEntry.getData().toString('utf-8'));
if (!manifest.version || !manifest.tables) {
  // validation tối thiểu — không check kiểu dữ liệu của từng field
}
```
Malformed manifest có thể inject SQL thông qua column names trong `Object.keys(row)`.

**Fix:** Validate column names trước khi chạy INSERT:
```typescript
const ALLOWED_COLUMNS: Record<string, Set<string>> = {
  people: new Set(['id', 'handle', 'display_name', 'gender', ...]),
  families: new Set(['id', 'handle', 'father_id', 'mother_id', ...]),
};

const columns = Object.keys(row).filter(c => ALLOWED_COLUMNS[table]?.has(c));
```

---

## ⚠️ Rủi ro Trung Bình (WARN)

### SEC-WARN-01 — Column name injection trong Desktop Query Builder

**File:** [src/app/api/desktop-db/query-builder.ts:275](src/app/api/desktop-db/query-builder.ts#L275)

**Vấn đề:**
```typescript
const setClauses = Object.keys(data).map(k => `"${k}" = ?`);
```
Column names từ client payload được nhúng vào SQL string. Mặc dù có dùng double-quote, attacker có thể truyền column name chứa `"` để phá vỡ query.

**Mức độ:** Thấp (desktop only, localhost), nhưng nên whitelist column names.

**Fix:** Validate column names theo schema whitelist trước khi build SQL.

---

### SEC-WARN-02 — deleteDocumentFile path extraction fragile

**File:** [src/lib/supabase-data-documents.ts:123](src/lib/supabase-data-documents.ts#L123)

**Vấn đề:**
```typescript
const path = fileUrl.split('/media/').pop();
// Nếu URL là: https://x.co/storage/v1/object/public/media/documents/media/file.pdf
// → pop() trả về "file.pdf" thay vì "documents/media/file.pdf"
```

**Fix:**
```typescript
const mediaIdx = fileUrl.indexOf('/media/');
const path = mediaIdx !== -1 ? fileUrl.slice(mediaIdx + '/media/'.length) : null;
```

---

### SEC-WARN-03 — Không có rate limiting trên auth routes

**Vấn đề:** Không có custom rate limiting. Supabase cung cấp rate limiting cơ bản nhưng không configurable cho free tier.

**Khuyến nghị:** Khi chuyển lên paid tier, bật Supabase Auth rate limiting. Hoặc thêm middleware kiểm tra IP.

---

### SEC-WARN-04 — Import không giới hạn file size

**File:** [src/app/api/desktop-import/route.ts:52-53](src/app/api/desktop-import/route.ts#L52)

**Vấn đề:** Không kiểm tra kích thước file ZIP trước khi parse.

**Fix:**
```typescript
const MAX_IMPORT_SIZE = 500 * 1024 * 1024; // 500MB
if (file.size > MAX_IMPORT_SIZE) {
  return NextResponse.json({ error: 'File too large' }, { status: 413 });
}
```

---

## Ma trận OWASP Top 10

| # | Risk | Status | Ghi chú |
|---|------|--------|---------|
| A01 | Broken Access Control | ✅ PASS | RLS + middleware role guard |
| A02 | Cryptographic Failures | ✅ PASS | Supabase JWT + HTTPS |
| A03 | Injection | ⚠️ WARN | Parameterized OK; column whitelist thiếu |
| A04 | Insecure Design | ✅ PASS | Privacy levels, allowedFields pattern |
| A05 | Security Misconfiguration | ❌ FAIL | No file size limit on upload |
| A06 | Vulnerable Components | ⚠️ INFO | Cần audit npm deps định kỳ |
| A07 | Identification & Auth | ✅ PASS | Supabase Auth + cookie-based JWT |
| A08 | Software Integrity | ❌ FAIL | Import manifest không validate schema |
| A09 | Logging & Monitoring | ⚠️ WARN | Console.error nhưng không có structured logging |
| A10 | Server-Side Request Forgery | ✅ N/A | Không có external HTTP calls từ server |

---

## Checklist Bổ sung (ASVS Level 1)

| Control | Status |
|---------|--------|
| Tất cả input được validate trước khi xử lý | ⚠️ Partial |
| File upload validate size + MIME | ❌ Missing |
| Không expose stack trace trong production | ✅ Pass |
| Auth token không lưu localStorage | ✅ Pass (cookie) |
| CSRF protection | ✅ Pass (SameSite cookie via Supabase) |
| Sensitive data không log | ✅ Pass |
| Admin functions require role check | ✅ Pass |
| SQL injection prevention | ✅ Pass (parameterized) |
| Path traversal prevention | ✅ Pass |
| Rate limiting | ⚠️ Cơ bản |

---

## Ưu tiên Fix

| Priority | Issue | Effort |
|----------|-------|--------|
| P0 | SEC-CRIT-01: File size limit | 30 phút |
| P0 | SEC-CRIT-02: MIME type validation | 30 phút |
| P1 | SEC-CRIT-03: Import schema validation | 2 giờ |
| P2 | SEC-WARN-01: Column whitelist | 3 giờ |
| P2 | SEC-WARN-02: Path extraction fix | 15 phút |
| P3 | SEC-WARN-04: Import size limit | 15 phút |
