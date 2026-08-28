# Audit tuân thủ Coding Standard — Gia phả Dòng họ

## Bối cảnh

Sau khi hoàn thành audit bảo mật/hiệu năng (`docs/security/AUDIT_PLAN.md`),
tiếp tục scan toàn bộ `src/` để đối chiếu với chuẩn code tại
`.cursor/rules/coding-standard.md` (barrel pattern 2nd-level, absolute
imports, no `any`/`unknown`, Server Component mặc định, function declaration
cho component, Props interface, tách data layer/hooks, dùng `cn()`, không màu
inline, form dùng react-hook-form+zod với schema tập trung). Kết quả tổng thể
**khá tốt** — phần lớn quy tắc được tuân thủ nghiêm túc, chỉ có một số vi phạm
nhỏ/rải rác cần dọn dần, không có vi phạm mang tính hệ thống.

File plan này sẽ được đặt tại **`docs/CODING_STANDARD_PLAN.md`** (cùng cấp
với `docs/security/AUDIT_PLAN.md`) để theo dõi tiến độ, tick từng mục khi sửa
xong.

---

## 🟠 Vi phạm đáng chú ý nhất (ưu tiên xử lý)

- [ ] **`admin-*-view.tsx` quá lớn, vi phạm Single Responsibility.** Các file
  sau gộp chung table/filter/dialog/mutation logic trong 1 file, cần tách nhỏ
  theo sub-component (table, filter-bar, dialogs riêng):
  - `src/components/users/admin-users-view.tsx` — 1062 dòng
  - `src/components/settings/admin-clan-settings-view.tsx` — 707 dòng
  - `src/components/fund/admin-fund-view.tsx` — 594 dòng
  - `src/components/contributions/admin-contributions-view.tsx` — 452 dòng
  - `src/components/cau-duong/admin-cau-duong-view.tsx` — 441 dòng
  - (Không tính `src/components/ui/sidebar.tsx` — file thư viện shadcn, không
    cần sửa)
  - Ngoài ra `src/components/people/family-relations-card.tsx` (756 dòng),
    `src/components/people/person-form.tsx` (752 dòng),
    `src/app/(landing)/page.tsx` (732 dòng),
    `src/components/tree/family-tree-canvas.tsx` (592 dòng) cũng nên xem xét
    tách nhỏ khi có dịp sửa liên quan.

- [ ] **Type dùng chung bị trùng lặp thay vì tập trung ở `src/types/`.**
  - `TreeData` interface định nghĩa **giống hệt nhau ở 2 nơi**:
    `src/lib/pdf-export.ts:30` và `src/lib/supabase-data.ts:1222` — cần gộp
    về 1 định nghĩa trong `src/types/tree.ts` rồi import lại ở cả 2 chỗ.
  - Các type domain-shape sau đang nằm trong `lib/` thay vì `types/`, nên cân
    nhắc chuyển vào `src/types/` nếu được tái sử dụng ở nhiều nơi:
    `GedcomIndividual`, `GedcomFamily`, `GedcomHeader`, `GedcomParseResult`,
    `ImportMapping`, `ImportSummary` (trong `src/lib/gedcom-import.ts`);
    `GenerationStat`, `ChiStat`, `GenderStat`, `LivingStat`, `DetailedStats`
    (trong `src/lib/stats-calculator.ts`); `RelationshipResult` (trong
    `src/lib/pathfinding.ts`).

---

## 🟡 Vi phạm nhỏ, dọn dần

- [ ] **`className` dùng template literal thay vì `cn()`.** 25 file dùng
  `className={\`...\`}` thay vì hàm `cn()` chuẩn (clsx+tailwind-merge) đã có
  sẵn ở `src/lib/utils.ts`. Danh sách tiêu biểu cần sửa:
  `src/components/people/avatar-upload.tsx:76`,
  `src/app/(landing)/page.tsx:311,313`,
  `src/components/tree/elderly-tree-view.tsx:108`,
  `src/components/people/person-card.tsx:72`,
  `src/components/users/admin-users-view.tsx:559`,
  `src/components/layout/notification-bell.tsx:111,122`,
  `src/components/people/family-relations-card.tsx:60,140,151,238`,
  `src/components/events/calendar-grid.tsx:119,124,136`,
  `src/components/fund/admin-fund-view.tsx:362`,
  `src/components/events/admin-events-view.tsx:225`,
  `src/components/layout/app-sidebar.tsx:165`,
  `src/components/feed/post-card.tsx:122` (và ~13 file khác cùng pattern).

- [ ] **`useQuery` gọi trực tiếp trong component thay vì qua hook riêng.**
  `src/components/settings/security-settings-view.tsx:49` import và gọi
  `useQuery` trực tiếp thay vì tách thành hook trong `src/hooks/`.

- [ ] **`useEffect` tự fetch auth/session thay vì qua react-query.**
  `src/components/auth/auth-provider.tsx:58-91` gọi trực tiếp
  `supabase.auth.getSession()`, `onAuthStateChange()`, và `fetchProfile()`
  trong `useEffect`. Đây là auth bootstrap ở gốc app nên có thể chấp nhận
  được như một ngoại lệ hợp lý, nhưng cần ghi chú rõ lý do (comment) để
  tránh bị hiểu nhầm là vi phạm khi review sau này — không bắt buộc refactor.

- [ ] **API routes gọi `supabase.from()` trực tiếp thay vì qua data layer.**
  `src/app/api/cron/route.ts:27` và
  `src/app/api/export/gedcom/route.ts:32-34` gọi thẳng `supabase.from()`
  thay vì qua `src/lib/supabase-data*.ts`. Nên cân nhắc chuyển các query này
  vào data layer để nhất quán, dù route handler không nằm trong phạm vi hẹp
  của rule (vốn nói về components/hooks).

- [ ] **2 chỗ dùng inline prop type thay vì `interface XProps` đặt tên.**
  - `src/components/auth/auth-provider.tsx:46` —
    `function AuthProvider({ children }: { children: ReactNode })`
  - `src/components/auth/verification-guard.tsx:15` —
    `function VerificationGuard({ children }: { children: React.ReactNode })`
  → Đổi thành `interface AuthProviderProps`/`VerificationGuardProps` cho nhất
  quán, dù đây là pattern pass-through đơn giản (mức độ vi phạm thấp).

- [ ] **1 component dùng arrow function thay vì `export function`.**
  `src/components/ui/sonner.tsx:13` — `const Toaster = ({ ...props }) => {}`.
  Đây là file wrapper cho thư viện `sonner`, có thể giữ nguyên theo pattern
  gốc của shadcn hoặc đổi sang `export function Toaster(props: ToasterProps)`
  để đồng bộ 100% — ưu tiên thấp.

---

## ✅ Đã kiểm tra, tuân thủ tốt — không cần sửa

- **Barrel pattern 2nd-level**: mọi thư mục 2nd-level dưới `components/`,
  `hooks/`, `services/`, `lib/api`, `lib/validations`, `types/`, `schemas/`
  đều có `index.ts` đầy đủ.
- **Absolute imports**: 0 import kiểu `../../` (2+ cấp); 0 import xuyên sâu
  vào file 3rd-level thay vì qua barrel. (24 import `../` 1 cấp chỉ nằm
  trong `src/messages/en/*.ts`, ngoài phạm vi rule, không đáng lo.)
  - Chỗ 83 import dùng thẳng root alias `@hooks`/`@services` là hợp lệ vì 2
    thư mục này vốn phẳng (không có 2nd-level con), nên alias root = alias
    2nd-level.
- **No `any`/`unknown`**: 0 chỗ dùng `any`; chỉ có 2 chỗ dùng `unknown` hợp lệ
  (catch-block error typing và rest-args typing) — không phải bypass type
  safety.
- **Server Components mặc định**: chỉ 13 file có `"use client"`, toàn bộ đều
  là wrapper cho Radix UI primitives trong `src/components/ui/` — cần thiết,
  không có trường hợp lạm dụng.
- **Function declaration cho component**: 143/144 component dùng
  `export function` đúng chuẩn (ngoại trừ `sonner.tsx` đã nêu ở trên).
- **Props interface**: hầu hết component đều có `interface XProps` đặt tên
  riêng (chỉ 2 ngoại lệ nhỏ đã liệt kê ở trên).
- **Data layer tách biệt**: không có component/page nào gọi
  `supabase.from()` trực tiếp — toàn bộ đi qua `src/lib/supabase-data*.ts`.
- **Không màu inline arbitrary** (`bg-[#...]`, `text-[#...]`...): 0 vi phạm.
- **Form dùng react-hook-form + zod schema tập trung**: toàn bộ 17 file form
  đều import schema từ `src/schemas/`, không có schema định nghĩa inline.

---

## Gợi ý thứ tự xử lý

1. Gộp `TreeData` interface trùng lặp về `src/types/` (nhanh, rủi ro thấp).
2. Tách nhỏ các `admin-*-view.tsx` quá lớn (ưu tiên `admin-users-view.tsx`
   1062 dòng trước vì lớn nhất).
3. Dọn `className` template-literal → `cn()` theo từng nhóm file khi tiện
   sửa (không cần làm riêng 1 đợt).
4. Các mục còn lại (props interface, arrow-function sonner, useQuery inline)
   sửa khi có thời gian rảnh, mức độ ưu tiên thấp.

---
---

# Audit khả năng triển khai Production

Kiểm tra `src/` + config repo (`next.config.ts`, `package.json`,
`vercel.json`, `Dockerfile`, `src/proxy.ts`) xem đã sẵn sàng deploy production
hay chưa, theo 3 mảng: (1) build/deploy config, (2) độ ổn định
runtime/observability, (3) hardening bảo mật riêng cho production (headers,
cookie, rate-limit). Phát hiện quan trọng nhất: **endpoint backup hiện luôn
lỗi 500** (bug logic, không fetch dữ liệu thật) nên app **chưa có cơ chế
backup/restore nào hoạt động** — cần vá song song với phần auth đã ghi ở audit
bảo mật phía trên. Ngoài ra thiếu hẳn security headers (CSP/HSTS), thiếu
`.env.example`/validation env vars, thiếu CI pipeline, thiếu health-check
endpoint, và rate-limit hiện chỉ chạy đúng khi tự host (không đúng nếu deploy
nhiều instance/serverless).

## 🔴 HIGH — Chặn go-live / rủi ro lớn

- [ ] **Backup export luôn lỗi 500 (bug, không chỉ thiếu auth).**
  `src/app/api/backup/route.ts:41-52` — biến `exportedData` khởi tạo rỗng và
  **không có vòng lặp fetch dữ liệu thật** từ các bảng
  `BACKUP_EXPORT_TABLES` trước khi đọc `exportedData[table].length` →
  luôn throw `TypeError`, bị `withApiHandler` nuốt thành lỗi 500 chung chung.
  Kết hợp với thiếu auth check (đã ghi ở phần Audit bảo mật phía trên), route
  này cần viết lại hoàn toàn logic fetch + thêm `requireRole()` cùng lúc.
- [ ] **Restore route mới là stub `501 Not Implemented`.**
  `src/app/api/backup/restore/route.ts:52-56` — báo lỗi rõ ràng (không giả
  vờ thành công) nhưng nghĩa là **hiện tại không có đường restore nào chạy
  được**. Ưu tiên thấp hơn export (vì export cũng đang hỏng), nhưng cần lên
  kế hoạch implement + auth check trước khi bật tính năng.
- [ ] **Thiếu toàn bộ security headers.** Không có `headers()` trong
  `next.config.ts`, `src/proxy.ts` không set response header nào. Không có
  Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options,
  Referrer-Policy (chỉ có `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy` set trong `vercel.json`, thiếu CSP và HSTS). Mọi trang
  kể cả `/admin` chứa dữ liệu cá nhân dòng họ đều thiếu lớp bảo vệ này.
  → Thêm `headers()` trong `next.config.ts` hoặc mở rộng `vercel.json` với
  CSP phù hợp (cho phép domain Supabase storage) và HSTS.
- [ ] **Rate limiting chỉ hoạt động đúng khi self-host 1 instance.**
  `src/proxy.ts:34` (`_rateLimitStore = new Map()`) là in-memory store cấp
  module — mỗi Vercel Edge isolate/serverless instance có map riêng, nên rate
  limit gần như vô hiệu khi scale nhiều instance (comment trong code đã tự
  ghi nhận, dựa vào rate-limit của GoTrue làm tuyến phòng thủ chính — không
  đủ). → Nếu deploy multi-instance/serverless, chuyển sang Upstash/Redis
  hoặc dịch vụ rate-limit tập trung.
- [ ] **Thiếu `.env.example` và validation env vars khi khởi động.** Không
  có file `.env.example` nào ở root để làm hợp đồng biến môi trường bắt
  buộc. Code dùng `process.env.X!` (non-null assertion, VD `src/proxy.ts:170,184`)
  hoặc fallback âm thầm (`next.config.ts` trả `[]` cho `remotePatterns` nếu
  thiếu `NEXT_PUBLIC_SUPABASE_URL`) thay vì fail rõ ràng lúc build/start. →
  Tạo `.env.example` liệt kê đủ:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_INTERNAL_URL`,
  `NEXT_PUBLIC_CLAN_NAME`, `NEXT_PUBLIC_CLAN_FULL_NAME`,
  `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `DEBUG_AUTH`, `MIDDLEWARE_LOG`,
  `BACKUP_DIR`; đồng thời thêm 1 module validate bằng `zod` chạy lúc app khởi
  động để fail sớm nếu thiếu biến bắt buộc.

## 🟠 MEDIUM — Nên xử lý trước khi/ngay sau go-live

- [ ] **Không có error tracking/alerting.** Không có Sentry hay dịch vụ
  tương tự, logging chỉ là `console.error` rải rác qua `withApiHandler`. Lỗi
  production sẽ vô hình ngoài log thô của hosting, không ai được cảnh báo.
  → Thêm Sentry (hoặc tương đương) tối thiểu cho error boundary + API routes.
- [ ] **Cron job im lặng khi lỗi, không có alerting.**
  `src/app/api/cron/route.ts` được bảo vệ đúng bằng `requireCronSecret`
  (OK), nhưng nếu lỗi (VD DB tạm ngưng ở gói free) chỉ trả JSON lỗi, không
  ai được thông báo cho đến khi người dùng report app down. → Thêm cảnh báo
  (Slack webhook / Sentry alert) khi cron thất bại.
- [ ] **Không có CI pipeline.** Không có `.github/workflows/*` — build/lint
  không được kiểm tra tự động trước khi deploy, phụ thuộc hoàn toàn vào build
  check của Vercel lúc deploy (không có gate sớm hơn, không chạy test).
  → Thêm workflow tối thiểu: lint + build trên PR.
- [ ] **Không có health-check endpoint chuẩn.** Chỉ có `/api/cron` (có secret,
  không dùng được cho uptime monitor công khai). → Thêm `/api/health` đơn
  giản (chỉ ping DB, không secret) để gắn uptime monitoring.
- [ ] **Không pin Node engine trong `package.json`.** `Dockerfile` pin
  `node:20-alpine` nhưng `package.json` không có field `engines`, nếu build
  bằng cách khác (không qua Docker) có thể dùng version Node khác gây lệch
  hành vi. → Thêm `"engines": { "node": ">=20" }`.
- [ ] **Server/client boundary chưa được enforce cứng cho service-role
  client.** `src/lib/supabase.ts` định nghĩa `createServiceRoleClient()`
  cùng file với browser client, không có `import 'server-only'` guard, và
  được re-export qua `src/lib/index.ts` — nhiều `'use client'` component
  import từ barrel `@lib` này. Giá trị secret không bị inline (đọc qua
  `process.env` runtime, không phải `NEXT_PUBLIC_*`) nên chưa lộ key thật,
  nhưng đây là vi phạm ranh giới server/client cần dọn. → Tách
  `createServiceRoleClient()` sang file riêng (VD `src/lib/supabase-admin.ts`),
  thêm `import 'server-only'` ở đầu file, và xác nhận bằng `next build` +
  bundle analyzer rằng code này không lọt vào client chunk.
- [ ] **Cookie SSR chưa override tường minh `Secure`/`SameSite`.**
  `src/proxy.ts:182-207` dùng `createServerClient` của `@supabase/ssr` nhưng
  không truyền `options` tường minh cho `response.cookies.set` — đang dựa
  hoàn toàn vào default của thư viện. → Thêm override tường minh
  (`secure: true` khi production, `sameSite: 'lax'`) để chắc chắn thay vì
  phụ thuộc default ẩn.
- [ ] **`remotePatterns` ảnh Supabase có thể rỗng âm thầm khi thiếu env.**
  `next.config.ts` sinh `images.remotePatterns` từ
  `NEXT_PUBLIC_SUPABASE_URL`; nếu biến này chưa set lúc build, patterns trả
  về `[]` mà build vẫn pass — ảnh từ Supabase Storage sẽ bị Next.js Image
  chặn hoàn toàn ở production mà không có cảnh báo build-time. → Thêm check
  fail-fast trong `next.config.ts` nếu thiếu biến này.

## 🟡 LOW — Cải thiện thêm

- [ ] **GEDCOM export không phân trang/stream.**
  `src/app/api/export/gedcom/route.ts:29-33` load toàn bộ `people`/
  `families`/`children` vào memory bằng `select('*')` không giới hạn — ổn
  với quy mô hiện tại nhưng sẽ là điểm nghẽn khi cây phả hệ lớn dần trên giới
  hạn bộ nhớ serverless (mặc định ~1024MB).
- [ ] **Vài `.then()` không có `.catch()` ở client.**
  `src/components/fund/admin-fund-view.tsx:388,564`,
  `src/components/auth/auth-provider.tsx:61,96` — chỉ ảnh hưởng phản hồi UI
  (toast báo lỗi), không gây crash vì chạy trong browser, nhưng nên thêm
  `.catch()` để không bỏ sót lỗi âm thầm.
- [ ] **`createServiceRoleClient()` tạo client mới mỗi lần gọi.**
  Không phải leak nghiêm trọng vì mỗi serverless invocation vốn là sandbox
  riêng, nhưng có thể cache thành singleton trong phạm vi 1 request để giảm
  overhead nhỏ.
- [ ] **Không có retry cho lỗi transient khi gọi Supabase.** Một lỗi mạng
  thoáng qua sẽ trả thẳng lỗi 500 cho người dùng thay vì tự retry 1-2 lần.

## ✅ Đã kiểm tra, ổn — không cần sửa

- `next.config.ts`: không bật `eslint.ignoreDuringBuilds` /
  `typescript.ignoreBuildErrors`; `output: 'standalone'` chỉ bật khi
  `DOCKER_BUILD=true`, đúng thiết kế dual-target (Vercel/Docker).
- `Dockerfile`: multi-stage build, non-root user (`nextjs:1001`), dùng
  `.next/standalone` đúng chuẩn.
- `src/proxy.ts` (middleware) chỉ dùng API tương thích Edge Runtime
  (`NextResponse`, `Map`, `fetch`, `@supabase/ssr`), không có `fs`/Node
  `crypto` — chạy được trên Edge.
- `error.tsx`, `global-error.tsx`, `not-found.tsx` đã có đầy đủ; mọi API
  route đều bọc qua `withApiHandler` nên không có unhandled exception làm
  sập process.
- Debug routes (`guardDevelopmentOnly`, `DEBUG_AUTH`) chỉ dựa vào biến môi
  trường server-side, không thể bypass qua header/query param từ client.
- `robots.txt`/`sitemap.ts` cấu hình đúng — chặn index các route dữ liệu
  riêng tư (`/people`, `/tree`, `/directory`, `/admin`), chỉ để lộ landing
  page công khai.
- Không có CORS wildcard, không có route public bị lộ cross-origin ngoài ý
  muốn.
- GEDCOM/PDF export chạy phía client (browser), không tốn thời gian
  chạy/serverless timeout của server.

## Gợi ý thứ tự xử lý (production readiness)

1. Vá bug backup export (viết lại logic fetch + thêm auth) — chặn go-live
   nếu tính năng backup được quảng cáo là đã có.
2. Thêm security headers (CSP, HSTS) + `.env.example` + zod validate env vars
   — nhanh, rủi ro thấp, tác động lớn tới an toàn khi lên production.
3. Thêm health-check endpoint + error tracking (Sentry) + alerting cho cron
   — giúp phát hiện sự cố sớm thay vì chờ người dùng report.
4. Đánh giá nhu cầu scale (nếu chỉ self-host 1 instance thì rate-limit
   in-memory tạm ổn; nếu deploy multi-instance/Vercel thì bắt buộc chuyển
   sang Redis/Upstash) rồi mới xử lý mục rate-limit.
5. Các mục MEDIUM/LOW còn lại xử lý dần khi rảnh.
