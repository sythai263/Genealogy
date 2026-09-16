---
project: AncestorTree
path: docs/CODEBASE-AUDIT.md
type: audit
version: 1.0.0
updated: 2026-09-16
owner: team
status: approved
---

# Codebase Audit — Docs vs. Source (2026-09-16)

> Đối chiếu toàn bộ `docs/` với `src/`, `supabase/migrations/`, `package.json`
> và config ở repo root. Nguồn chân lý là **code hiện tại**.
>
> Kết luận chính:
> 1. **Desktop/Electron đã bị xóa khỏi codebase** (CLAUDE.md v3: pure web) nhưng
>    vẫn còn mô tả rộng rãi trong ~10 docs → các docs đó đã được đánh dấu
>    "historical" hoặc cập nhật.
> 2. **Backup/Restore đang hỏng**: `/api/backup` luôn lỗi 500,
>    `/api/backup/restore` trả 501 → cần implement (xem §Kế hoạch).
> 3. **Word export chưa tồn tại** dù docs mô tả chi tiết; **PDF export là dead
>    code** (lib có sẵn nhưng không có UI nào gọi).
> 4. DB hiện có **20 bảng + 16 RPC**, docs chỉ mô tả ~13 bảng + 1 RPC.
> 5. Không còn file test nào (`vitest.config.ts` tồn tại nhưng 0 `*.test.*`).

---

## 1. Ma trận trạng thái tính năng

### 1.1 Đã implement trong code

| Tính năng | Code | Trạng thái docs |
|-----------|------|-----------------|
| Auth (login/register/forgot/reset/pending-verification, MFA TOTP) | `src/app/(auth)/`, `src/proxy.ts`, `src/lib/login-lockout.ts` | ✅ Đúng |
| People CRUD + search (`search_people_filtered`, `search_people_advanced` RPC) | `src/app/(main)/people/`, `src/lib/supabase-data.ts` | ⚠️ RPC chưa được liệt kê trong API-ENDPOINTS |
| Tree view (d3, lazy-load) | `src/components/tree/` | ✅ Đúng |
| Directory, Events, Contributions, Achievements, Fund, Charter, Cầu đương | `src/app/(main)/*` | ✅ Đúng |
| Relationship finder, Stats dashboard | `/relationship`, `/stats` | ⚠️ Thiếu trong API-ENDPOINTS route list |
| Documents (library + book generator) | `/documents`, `/documents/library`, `/documents/book`, `lib/book-generator.ts` | ⚠️ `/documents/library` thiếu trong docs |
| Feed + Notifications | `/feed`, `/notifications`, `supabase-data-feed.ts`, `supabase-data-notifications.ts` | ⚠️ Bảng `posts`/`post_*`/`notifications` chưa có trong ERD/API-ENDPOINTS |
| Registrations (`member_registrations`) | `/register-member`, `/admin/registrations` | ⚠️ Thiếu trong ERD/API-ENDPOINTS |
| User management + roles + suspension | `/admin/users`, `supabase-data-users.ts` | ✅ Đúng (Sprint 12) |
| Clan settings | `/admin/settings`, `clan_settings` table | ⚠️ Thiếu trong ERD/API-ENDPOINTS |
| GEDCOM export + import | `/api/export/gedcom`, `lib/gedcom-*.ts`, `/admin/import` | ✅ Export đúng; ⚠️ `/admin/import-export` trong docs → thực tế tách thành `/admin/import` + `/admin/export` |
| CSV export, Markdown export | `lib/csv-export.ts` (fund + admin export), `lib/markdown-export.ts` (admin export) | ⚠️ Chưa mô tả trong API-ENDPOINTS |
| Duplicate detection | `/admin/duplicates`, `lib/duplicate-detection.ts` | ⚠️ Chưa có trong API-ENDPOINTS |
| Spouses admin | `/admin/spouses`, `components/spouses/`, `lib/spouse-utils.ts` | ⚠️ Chưa có trong API-ENDPOINTS |
| i18n (next-intl, vi + en đầy đủ, LocaleSwitcher) | `src/i18n/`, `src/messages/{vi,en}/` | ❌ roadmap ghi "P2 tương lai" — thực tế đã làm xong |
| Public landing: `/`, `/welcome`, `/family-tree`, `/ancestral-hall`, `/council`, `/register-member` | `src/app/(landing)/`, `public_tree_data` migration | ⚠️ `/family-tree` (cây công khai) chưa có trong docs |
| SEO: `sitemap.ts`, `public/robots.txt` | OK | ✅ Đúng |
| Cron keep-alive `/api/cron` (Vercel cron, daily) + security headers trong `vercel.json` | `src/app/api/cron/route.ts`, `vercel.json` | ❌ Không docs nào đề cập |
| Debug endpoint `/api/debug/auth` (dev-only, `DEBUG_AUTH`) | `src/app/api/debug/auth/route.ts` | ❌ Chưa mô tả |
| Backup schedule reminder (localStorage) | `use-backup-schedule.ts`, `backup-schedule-section.tsx`, `backup-due-banner.tsx` | ❌ Chưa mô tả |
| Rate limiting (proxy.ts) + login backoff | `src/proxy.ts`, `lib/login-lockout.ts` | ✅ Đúng (nhưng tên file: docs ghi `middleware.ts`) |
| Elderly mode, image compression, fuzzy search | `contexts/elderly-context.tsx`, `lib/image-compression.ts`, `use-fuzzy-search.ts` | ⚠️ Chưa mô tả |

### 1.2 Documented nhưng KHÔNG có trong code / đang hỏng

| Hạng mục | Docs nói | Thực tế | Độ ưu tiên |
|----------|----------|---------|------------|
| **POST `/api/backup`** | Xuất 13 bảng → ZIP | `exportedData` khởi tạo rỗng, không fetch → **luôn 500** | 🔴 P0 |
| **POST `/api/backup/restore`** | Restore ZIP vào DB | Trả **501 Not Implemented** | 🔴 P0 |
| **Word export** (`lib/word-export.ts`, deps `docx`+`file-saver`) | API-ENDPOINTS §7 mô tả đầy đủ | File và deps **không tồn tại** | 🟠 P1 |
| **PDF export** (`lib/pdf-export.ts`, `jspdf`+`html2canvas`) | API-ENDPOINTS §6 mô tả + nút "Xuất Gia Phả" trong tree toolbar | Lib tồn tại nhưng **không component nào gọi** → dead code ~600 dòng | 🟠 P1 (wire lại hoặc xóa) |
| **Desktop app (Electron + sql.js)** | SPRINT-PLAN S9, INSTALLATION-GUIDE, TEST-PLAN §5, TEST-PLAN-sprint9, technical-design §10.3, ADR-003 | **Đã xóa hoàn toàn** — không `desktop/`, không `/api/desktop-*`, `/api/media/[...path]` | N/A (đánh dấu historical) |
| **Tests** | TEST-PLAN-sprint9: "63/63 passing", `pnpm test` | `vitest.config.ts` có nhưng **0 file test**; `package.json` không có script `test` | 🟠 P2 |
| **`docker-compose.yml` + `.env.docker.example`** | DOCKER-GUIDE | Không tồn tại trong repo (chỉ có `Dockerfile` ở root) | 🟡 P2 |
| **`.env.example` / `.env.local.example`** | LOCAL-DEVELOPMENT, AUDIT_PLAN | Không tồn tại | 🟡 P2 |
| **`docs/02-design/ADR/ADR-001,002,004`** | technical-design link tới | Chỉ có ADR-003 | 🟡 đã sửa link |
| **`docs/02-design/SYSTEM-DESIGN.md`, `DATABASE-SCHEMA.md`** | docs/README link tới | Không tồn tại | 🟡 đã sửa link |
| **`src/middleware.ts`** | docs nhiều chỗ | File thực tế là `src/proxy.ts` (Next.js 16 convention) | 🟡 đã sửa docs |
| **`frontend/` directory** | nhiều docs | Repo root chính là app (`src/`, `supabase/`, `package.json` ở root) | 🟡 đã sửa docs |

### 1.3 Trong code nhưng chưa khớp docs (khác biệt nhỏ)

- **Bảng DB**: docs ERD liệt kê ~13 bảng; thực tế 20 — thêm `clan_documents`,
  `clan_settings`, `member_registrations`, `notifications`, `posts`,
  `post_comments`, `post_likes`. (media đã có.)
- **RPC**: docs chỉ có `is_person_in_subtree`; thực tế thêm
  `search_people_filtered`, `search_people_advanced`,
  `get_people_filter_options`, `get_people_stats`, `get_fund_balance`,
  `is_admin`, `is_admin_or_editor`, `is_verified_user`,
  `owns_person_media_path`, `handle_new_user`, `notify_post_comment`,
  `notify_post_like`, `update_post_comments_count`, `update_post_likes_count`.
- **Versions**: `package.json` hiện Next 16.3.0 / React 19.2.8 /
  `@supabase/ssr` 0.12.4 / React Query 5.101.4 / zod 4.4.3 — SPRINT-PLAN ghi
  bản cũ hơn. `version` trong package.json là `2.5.0` dù docs gọi v3.0.0.
- **Deps**: `zustand` không còn trong package.json (docs ghi "installed");
  `framer-motion` có trong deps nhưng **0 import** (dead dependency);
  ADR-003 nói `archiver`+`yauzl` — thực tế dùng `adm-zip`.
- **Backup table list**: `BACKUP_EXPORT_TABLES` chỉ có 13 bảng cũ — thiếu
  `posts`, `post_comments`, `post_likes`, `notifications`,
  `member_registrations`, `clan_settings`, `profiles` (7 bảng mới).

---

## 2. Kế hoạch triển khai tính năng chưa có / đang hỏng

### P0 — Backup & Restore (đang quảng cáo là có, thực tế hỏng)

**P0.1 — Sửa `POST /api/backup`** (`src/app/api/backup/route.ts`)
- Thêm `requireRole('admin')` (hiện route không check quyền).
- Tạo service-role client, loop `BACKUP_EXPORT_TABLES`, `select('*')` từng
  bảng (phân trang 1000 dòng/lần nếu cần) → đổ vào `exportedData`.
- Mở rộng `BACKUP_EXPORT_TABLES` lên đủ 20 bảng (thêm `profiles`, `posts`,
  `post_comments`, `post_likes`, `notifications`, `member_registrations`,
  `clan_settings`) — cần quyết định thứ tự restore (FK dependencies).
- Giữ `persistToBackupDir()` (BACKUP_DIR) và `apiFile()` response hiện có.

**P0.2 — Implement `POST /api/backup/restore`**
- Sau khi parse manifest (đã có): validate từng table name nằm trong whitelist,
  validate column names per-table (SEC-CRIT-03 đã ghi ý định này trong header
  file nhưng chưa implement).
- Xóa dữ liệu theo thứ tự ngược FK (children → families → people → ...).
- Upsert/insert theo batch 500 rows qua service-role client.
- Trả response `{ ok, tables, total_inserted, errors }` như docs §1.5.
- Trả lỗi rõ ràng nếu `SUPABASE_SERVICE_ROLE_KEY` thiếu.

**P0.3 — Xác minh luồng UI**: `/admin/backup` (download + restore + schedule
reminder localStorage) hoạt động end-to-end sau khi 2 API trên chạy.

### P1 — Export features

**P1.1 — Word export**: chọn 1 trong 2 —
(a) Implement theo đúng spec API-ENDPOINTS §7 (thêm `docx` + `file-saver`,
viết `lib/word-export.ts`, thêm nút vào tree toolbar), hoặc
(b) Rút spec §7 khỏi docs nếu quyết định không làm.
→ Khuyến nghị (a) nếu PDF export được wire lại, vì spec đã rất chi tiết.

**P1.2 — PDF export dead code**: chọn 1 trong 2 —
(a) Wire `exportFullGiaPha`/`exportTreeToPdf` vào `/admin/export` hoặc tree
toolbar (import qua `next/dynamic`, **tách khỏi barrel `@lib`** để
`jspdf`/`html2canvas` không lọt vào bundle chung), hoặc
(b) Xóa `lib/pdf-export.ts` + gỡ `jspdf`/`html2canvas` khỏi package.json.
→ Khuyến nghị (a): lib đã viết xong, chỉ thiếu trigger UI.

### P2 — Chất lượng & vận hành

- **P2.1**: Gỡ `framer-motion` (0 import) khỏi dependencies.
- **P2.2**: Tạo `.env.example` ở root + (tùy chọn) `.env.docker.example`,
  `docker-compose.yml` nếu muốn giữ DOCKER-GUIDE nguyên văn; nếu không, sửa
  guide theo `Dockerfile` đơn lẻ.
- **P2.3**: Thêm `pnpm test` script + viết lại test tối thiểu cho
  `lib/pathfinding.ts`, `lib/stats-calculator.ts`, `lib/gedcom-*.ts`
  (pure functions, dễ test). Test desktop cũ đã xóa theo code desktop.
- **P2.4**: Bump `package.json` `version` → 3.0.0 cho khớp docs.
- **P2.5** (theo AUDIT_PLAN, vẫn mở): RPC cho pathfinding/detailed stats,
  `d3` submodule imports, security headers (CSP/HSTS), `/api/health`,
  CI pipeline, Sentry — xem chi tiết `docs/security/AUDIT_PLAN.md`.

### P3 — Không làm (ghi nhận)

- Desktop/Electron: đã xóa có chủ đích theo CLAUDE.md v3.0.0 (Pure Web).
  Các docs liên quan được giữ lại như tài liệu lịch sử.

---

## 3. Docs đã cập nhật trong đợt audit này

| File | Thay đổi |
|------|----------|
| `docs/README.md` | Sửa broken links, cấu trúc repo, stack |
| `docs/backend/API-ENDPOINTS.md` | Xóa desktop routes; thêm `/api/cron`, `/api/debug/auth`; sửa trạng thái backup (P0 bugs); bổ sung bảng/RPC còn thiếu; đánh dấu PDF dead-code và Word chưa implement |
| `docs/02-design/technical-design.md` | `frontend/` → root; `middleware.ts` → `proxy.ts`; đánh dấu §Desktop historical; sửa ADR links; cập nhật migration list |
| `docs/02-design/ADR/ADR-003-*.md` | Ghi chú `adm-zip` thay `archiver`/`yauzl`; desktop context = historical |
| `docs/00-foundation/VISION.md` | Đánh dấu v2.0.0 Desktop đã gỡ; chuyển các mục "Planned" đã ship |
| `docs/01-planning/roadmap.md` | Ghi chú desktop đã gỡ; i18n đã implement |
| `docs/04-build/SPRINT-PLAN.md` | Cập nhật bảng dependency versions; ghi chú Sprint 9 historical |
| `docs/04-build/INSTALLATION-GUIDE.md` | Banner deprecated (desktop app đã gỡ) |
| `docs/04-build/LOCAL-DEVELOPMENT.md` | `cd frontend` → root; số migrations 5 → 24; sửa file structure |
| `docs/04-build/DOCKER-GUIDE.md` | Ghi chú `docker-compose.yml`/`.env.docker.example` chưa tồn tại; `Dockerfile` ở root |
| `docs/05-test/TEST-PLAN.md` | `cd frontend` → root; §5 desktop = obsolete; ghi chú hiện 0 test files |
| `docs/05-test/TEST-PLAN-sprint9.md` | Banner historical |
| `docs/backend/SECURE-CODING-REVIEW.md` | Thêm mục "Cập nhật trạng thái 2026-09" — phần lớn findings đã được vá hoặc obsolete cùng desktop |
| `docs/security/AUDIT_PLAN.md` | Ghi chú findings backup vẫn còn nguyên (đã xác minh lại) |
