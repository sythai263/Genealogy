# Audit bảo mật & hiệu năng — Gia phả Dòng họ

## Bối cảnh

Dự án dùng Next.js 16 + Supabase (RLS) + react-query. Đã audit toàn bộ
`src/` theo 3 mảng: (1) auth/Supabase client/data layer, (2) API routes/server
actions, (3) components/hooks/rendering. Nhìn chung kiến trúc auth cốt lõi
(`getUser()` trong middleware, service-role key chỉ dùng server-side) đã đúng
chuẩn. Vấn đề nghiêm trọng nhất là **2 API route backup/restore không có
auth check** — có thể bị khai thác để tải toàn bộ DB hoặc xóa dữ liệu. Phần
còn lại là các cải thiện về hiệu năng (pagination, staleTime, re-render cây
gia phả) và một vài điểm cần làm cứng thêm (hardening) chứ không phải lỗ hổng
đang bị khai thác.

Danh sách dưới đây xếp theo mức độ nghiêm trọng để sửa dần, tick từng mục khi
xong.

---

## 🔴 HIGH — Cần sửa ngay

- [ ] **`src/app/api/backup/route.ts`** — endpoint `POST` export toàn bộ 13
  bảng DB (dùng service-role client, bỏ qua RLS) thành file ZIP, nhưng
  **không gọi `requireRole()`** như `src/app/api/export/gedcom/route.ts` đã
  làm đúng. `src/middleware.ts` (`authRequiredPaths`) chỉ liệt kê các route
  trang (`/people`, `/admin`...), không bao gồm `/api/backup`, nên middleware
  cho qua request bất kể có đăng nhập hay không.
  → **Fix:** thêm `requireRole(request, 'admin')` (hoặc tương đương) ngay đầu
  handler, giống cách `gedcom/route.ts` đang làm.
  → Đồng thời route này hiện có bug runtime: `exportedData` không được điền
  dữ liệu thật từ DB trước khi đọc `.length` ở dòng ~41-51 → luôn throw
  TypeError (bị nuốt bởi `withApiHandler` thành lỗi 500 chung chung). Cần sửa
  luôn logic fetch dữ liệu khi thêm auth check.

- [ ] **`src/app/api/backup/restore/route.ts`** — cũng không có auth check.
  Hiện là stub (`notImplemented`) nhưng docstring ghi rõ đây là thao tác
  **destructive** (xóa toàn bộ bảng trước khi restore). Phải thêm
  `requireRole()` **trước khi** implement logic restore thật, tránh trở
  thành endpoint xóa/ghi đè dữ liệu không cần xác thực.
  → Khi implement, thêm `allowedMimeTypes: ['application/zip']` vào
  `validateUpload()` (hiện chỉ check size).

---

## 🟠 MEDIUM — Nên sửa sớm

- [ ] **Trùng lặp logic kiểm tra quyền admin.** `src/app/(main)/admin/users/actions.ts:26-57`
  tự check `caller.role === 'admin'` (đúng, vì Server Actions không đi qua
  middleware `matcher`), nhưng logic này lặp lại ở nhiều nơi. Nên tách thành
  helper dùng chung `requireAdmin()` trong `src/lib/api/guards.ts` để mọi
  server action/route admin trong tương lai không quên check.

- [ ] **Client-side MIME check có thể bị bypass.** `src/lib/supabase-storage.ts`
  (`assertAllowedType()`) chỉ kiểm tra `file.type` (giá trị do browser cung
  cấp, có thể giả mạo) trước khi upload thẳng lên Supabase Storage. Cần xác
  nhận bucket Supabase có cấu hình `allowedMimeTypes` ở tầng server/storage
  policy — nếu chưa có, thêm vào config bucket để chặn upload SVG có
  script/file độc hại kể cả khi JS check bị bypass.

- [ ] **React Query thiếu `staleTime`/`gcTime`.** Các hook sau đang dùng mặc
  định `staleTime: 0` → refetch liên tục mỗi lần mount/focus window:
  `src/hooks/use-notifications.ts`, `use-feed.ts`, `use-registrations.ts`,
  `use-events.ts`, `use-profiles.ts`, `use-media.ts`, `use-contributions.ts`.
  → Thêm `staleTime` hợp lý (ví dụ 30s-5 phút tùy loại dữ liệu) cho từng hook,
  ưu tiên feed và notification vì tần suất gọi cao nhất.

- [ ] **Re-render toàn bộ cây gia phả khi chỉ chọn 1 node.**
  `src/components/tree/family-tree-canvas.tsx:258-566` — effect chính build
  lại `d3.hierarchy`/`d3.tree()` và toàn bộ DOM node có `selectedPersonId`
  trong dependency array (dòng ~562), nghĩa là mỗi lần click chọn người sẽ
  tính lại layout + re-render toàn bộ card, kể cả cây có hàng trăm/nghìn
  thành viên. → Tách effect: việc tô sáng node được chọn nên chỉ toggle CSS
  class, không trigger lại tính toán layout.

---

## 🟡 LOW — Hardening / cải thiện dần

- [ ] **Debug endpoint lộ một phần secret.** `src/app/api/debug/auth/route.ts:95`
  trả về preview 20 ký tự đầu của `SUPABASE_SERVICE_ROLE_KEY`. Dù đã có
  `guardDevelopmentOnly()` + cờ `DEBUG_AUTH=true` chặn ở production, nên bỏ
  hẳn việc trả preview service-role key thay vì chỉ truncate, để tránh rủi ro
  nếu env bị cấu hình sai ở production.

- [ ] **Không có rate limiting cho `/api/*`.** `src/middleware.ts` hiện chỉ
  rate-limit các route trang (`/login`, `/register`...), không áp dụng cho
  API routes — càng cần thiết sau khi vá lỗ hổng backup ở trên để tránh lạm
  dụng export dữ liệu lặp lại.

- [ ] **`select('*')` tràn lan, không phân trang.** Nhiều hàm trong
  `src/lib/supabase-data*.ts` (46+ lần riêng trong `supabase-data.ts`) fetch
  toàn bộ cột và không có `.range()`/`.limit()`, đặc biệt `getTreeData()`
  (dòng ~1252-1256) load toàn bộ `people`, `families`, `children`. Khi dữ
  liệu dòng họ lớn dần, cần: chọn cột cụ thể thay vì `*`, và thêm phân trang
  cho các danh sách (feed, tài liệu, tìm kiếm người) — giữ nguyên load toàn
  bộ cho riêng cây phả hệ nếu UI yêu cầu render trọn cây.

- [ ] **Hàm escape HTML thủ công trong tree canvas dễ vỡ khi thêm field mới.**
  `family-tree-canvas.tsx` dùng `escapeHtml()` (dòng 92-98) thủ công trước khi
  build chuỗi HTML để d3 `.html()` vào `foreignObject`. An toàn hiện tại,
  nhưng nếu sau này thêm field mới (VD: tiểu sử/ghi chú) vào template mà quên
  escape sẽ tạo lỗ hổng XSS lưu trữ. Nên chuyển sang dựng DOM node thay vì
  string template, hoặc thêm comment/lint nhắc nhở escape bắt buộc.

- [ ] **`useEffect` fetch thay vì react-query.**
  `src/components/settings/profile-form.tsx` tự fetch bằng `useEffect` —
  chuyển sang react-query hook để nhất quán cache/loading state với phần còn
  lại của app.

- [ ] **`<img>` thường thay vì `next/image`.** `src/app/(landing)/page.tsx:346`
  (ảnh hero landing page) — chuyển sang `next/image` để tối ưu ảnh
  (lazy-load, responsive sizes tự động).

---

## ✅ Đã kiểm tra, không có vấn đề

- Service-role key chỉ dùng server-side, không lộ vào bundle client.
- Không có secret hardcode / commit vào git (`.env.local` đã `.gitignore`).
- Middleware dùng `getUser()` (verify JWT) cho quyết định phân quyền, đúng
  khuyến nghị Supabase; 3 chỗ dùng `getSession()` đều ở client, chỉ dùng cho
  UI branching — chấp nhận được.
- Không có SQL injection: `searchPeople()` escape `%`, `_`, `\` trước khi
  `.ilike()`; không có raw SQL string interpolation.
- Không có N+1 query loop.
- Không có `dangerouslySetInnerHTML`, không CORS wildcard, không
  `eval`/`child_process`.
- Không có `NEXT_PUBLIC_*` env nhạy cảm bị lộ.

---

## Gợi ý thứ tự xử lý (bảo mật & hiệu năng)

1. Vá 2 endpoint backup/restore (HIGH) — ưu tiên tuyệt đối vì đang khai thác
   được ngay hôm nay.
2. Tách `requireAdmin()` helper dùng chung + xác nhận bucket storage MIME
   allowlist (MEDIUM).
3. Thêm `staleTime` cho các hook react-query + sửa re-render tree khi chọn
   node (MEDIUM, cải thiện trải nghiệm rõ rệt).
4. Dọn dần các mục LOW khi có thời gian.

---
---

# Audit tuân thủ Coding Standard

Đối chiếu `src/` với `.cursor/rules/coding-standard.md` (barrel pattern
2nd-level, absolute imports, no `any`/`unknown`, Server Component mặc định,
function declaration cho component, Props interface, tách data layer/hooks,
dùng `cn()`, không màu inline, form dùng react-hook-form+zod với schema tập
trung). Kết quả tổng thể **khá tốt** — phần lớn quy tắc được tuân thủ nghiêm
túc, chỉ có một số vi phạm nhỏ/rải rác cần dọn dần, không có vi phạm mang
tính hệ thống.

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

## Gợi ý thứ tự xử lý (coding standard)

1. Gộp `TreeData` interface trùng lặp về `src/types/` (nhanh, rủi ro thấp).
2. Tách nhỏ các `admin-*-view.tsx` quá lớn (ưu tiên `admin-users-view.tsx`
   1062 dòng trước vì lớn nhất).
3. Dọn `className` template-literal → `cn()` theo từng nhóm file khi tiện
   sửa (không cần làm riêng 1 đợt).
4. Các mục còn lại (props interface, arrow-function sonner, useQuery inline)
   sửa khi có thời gian rảnh, mức độ ưu tiên thấp.
