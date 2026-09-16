---
project: AncestorTree
path: docs/backend/API-ENDPOINTS.md
type: api-reference
version: 2.0.0
updated: 2026-09-16
owner: team
status: approved
---

# API Endpoints — AncestorTree v3.0.0

> **Kiến trúc:** Next.js App Router + Supabase PostgREST (pure web)
> **Auth:** Supabase JWT (cookie-based via `@supabase/ssr`)
> **Middleware file:** `src/proxy.ts` (Next.js 16 proxy convention)
>
> **2026-09:** Desktop/Electron đã bị gỡ khỏi codebase. Các route
> `/api/desktop-db`, `/api/media/[...path]`, `/api/desktop-export`,
> `/api/desktop-import` không còn tồn tại — mô tả lịch sử xem git history.

---

## 0. Rate Limiting

> **Ưu tiên:** Vận hành (không siết chặt). Cho phép người dùng hợp lệ hoạt động bình thường, chặn bot/brute force cơ bản.

### 0.1 Kiến trúc 3 lớp

| Lớp | Nơi thực thi | Phạm vi |
|-----|-------------|---------|
| **GoTrue** | Supabase Auth server | Chặn brute force trực tiếp vào `/auth/v1/*` |
| **proxy.ts** | Next.js Middleware | Giới hạn tải trang auth theo IP |
| **Client-side** | `login/page.tsx` | Backoff UX sau N lần thất bại liên tiếp |

### 0.2 GoTrue Rate Limits (`supabase/config.toml`)

| Endpoint | Giới hạn | Cửa sổ |
|----------|----------|--------|
| Sign-in / Sign-up | 30 lần | 5 phút / IP |
| OTP / Token verification | 30 lần | 5 phút / IP |
| Token refresh | 150 lần | 5 phút / IP |
| Email gửi (reset, confirm) | 5 lần | 1 giờ / IP |
| Email cooldown | 1 lần | 1 phút / địa chỉ |

### 0.3 Middleware Rate Limits (`proxy.ts`)

Áp dụng cho tất cả request (GET + POST) đến trang auth theo IP (`X-Forwarded-For`).

| Path | Max | Cửa sổ | Mục đích |
|------|-----|--------|---------|
| `/login` | 20 | 60s | Ngăn page enumeration |
| `/register` | 10 | 60s | Ngăn spam đăng ký |
| `/forgot-password` | 6 | 5 phút | Ngăn email spam |
| `/reset-password` | 10 | 60s | Ngăn brute force token |

**Response khi vượt giới hạn:**
```
HTTP 429 Too Many Requests
Retry-After: <seconds>
X-RateLimit-Limit: <max>
X-RateLimit-Remaining: 0
Content-Type: application/json

{ "error": "Quá nhiều yêu cầu. Vui lòng thử lại sau.", "retryAfter": <seconds> }
```

### 0.4 Client-side Backoff (`login/page.tsx`)

Bảo vệ luồng `signInWithPassword` (gọi trực tiếp GoTrue, bypass proxy).

| Lần thất bại | Khóa |
|-------------|------|
| ≥ 5 lần | 30 giây |
| ≥ 8 lần | 120 giây |
| ≥ 12 lần | 300 giây |

Nút "Đăng nhập" hiển thị countdown `Thử lại sau Xs` khi đang bị khóa. Bộ đếm reset về 0 khi đăng nhập thành công.

---

## 1. Next.js Internal API Routes

> Toàn bộ route nội bộ hiện có trong `src/app/api/`. Mọi handler đều bọc qua
> `withApiHandler` (`src/lib/api/handler.ts`).

| Method | Path | Mô tả | Trạng thái |
|--------|------|--------|------------|
| POST | `/api/backup` | Xuất DB ra file ZIP | ✅ |
| POST | `/api/backup/restore` | Khôi phục từ file ZIP | ✅ |
| GET | `/api/cron` | Vercel Cron keep-alive + `event_reminder` notifications (daily, `vercel.json`) — yêu cầu `CRON_SECRET` | ✅ |
| GET | `/api/debug/auth` | Debug auth/env/Supabase connectivity — chỉ non-production + `DEBUG_AUTH=true` | ✅ |
| GET | `/api/export/gedcom` | Export GEDCOM (.ged) toàn bộ cây | ✅ |
| GET | `/api/health` | Health check (liveness) | ✅ |
| POST | `/api/notifications/broadcast` | Gửi notification `system` tới toàn bộ user (admin) | ✅ |

### 1.1 Backup Export — `POST /api/backup` ✅

> **Status:** Đã fix (2026-09-16). Route yêu cầu `Authorization: Bearer
> <access_token>` của user có role `admin`/`editor` (`requireRole`), dùng
> service-role client để bypass RLS, fetch `select('*')` phân trang 1000
> dòng/lần cho từng bảng trong `BACKUP_EXPORT_TABLES`.

**Thiết kế** (theo `src/app/api/backup/route.ts` + `constants/backup.ts`):

- Zip bằng `adm-zip`, tên file `giapha-YYYY-MM-DD.zip`.
- `BACKUP_EXPORT_TABLES` gồm đủ 20 bảng (đã mở rộng: `profiles`, `posts`,
  `post_comments`, `post_likes`, `notifications`, `member_registrations`,
  `clan_settings`, ...).
- Nếu env `BACKUP_DIR` được set (Docker volume), ZIP được ghi thêm ra host.

**manifest.json schema (v1.0):**
```json
{
  "version": "1.0",
  "app_version": "<APP_VERSION>",
  "exported_at": "ISO-8601",
  "row_counts": { "people": 18, "clan_documents": 5 },
  "tables": { "people": [...], "...": [...] }
}
```

**Response:** `application/zip` binary.

### 1.2 Backup Restore — `POST /api/backup/restore` ✅

> **Status:** Đã implement (2026-09-16). Yêu cầu `Authorization: Bearer
> <access_token>` của admin/editor; validate đầy đủ rồi ghi DB bằng
> service-role client.

**Request:**
```
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
Form fields: file: <ZIP binary>
```

**Pipeline:**
1. Validate multipart file, giới hạn 500 MB (`BACKUP_MAX_IMPORT_SIZE`).
2. Parse `manifest.json` (`src/lib/backup-manifest.ts`): check version, table
   names nằm trong whitelist, column names theo `BACKUP_TABLE_COLUMNS`
   allowlist per-table (SEC-CRIT-03), row shape.
3. Xóa dữ liệu theo thứ tự **ngược FK** (`BACKUP_RESTORE_ORDER` đảo) —
   destructive.
4. Insert batch 500 rows theo thứ tự FK xuôi qua service-role client.
5. Trả `{ ok, tables, total_inserted, errors }` (`RestoreResult`).

**Giới hạn bảo mật:**
- Max file size: 500 MB (`BACKUP_MAX_IMPORT_SIZE`)
- `requireRole` admin/editor + `SUPABASE_SERVICE_ROLE_KEY` server-side

### 1.3 Cron — `GET /api/cron`

Keep-alive ping để Supabase free-tier không bị pause + sinh notification
`event_reminder` cho sự kiện/ngày giỗ sắp tới. Cấu hình trong `vercel.json`
(`"schedule": "0 0 * * *"`), yêu cầu `CRON_SECRET`.

### 1.4 Health — `GET /api/health`

Liveness probe cho Docker/uptime monitor: trả `{ ok: true, ... }`, không yêu
cầu auth.

### 1.5 Notification Broadcast — `POST /api/notifications/broadcast`

`requireRole` admin. Body `{ title, body }` → insert notification loại
`system` cho toàn bộ user. UI: Admin → Settings → "Broadcast notification".

- Header bắt buộc: `Authorization: Bearer <CRON_SECRET>` (qua `requireCronSecret`).
- Hành vi: `SELECT user_id FROM profiles LIMIT 1` bằng service-role client.
- Response: `{ "ok": true, "data": { "success": true, "timestamp": "..." } }`.

### 1.4 Debug — `GET /api/debug/auth`

- Chỉ phục vụ ngoài production **và** khi `DEBUG_AUTH=true`
  (`guardDevelopmentOnly`).
- Trả về auth state, env preview (secret bị cắt 20 ký tự), kết quả probe
  Supabase. Không dùng cho monitoring công khai.

### 1.5 GEDCOM Export — `GET /api/export/gedcom`

- Yêu cầu đăng nhập (role theo RLS); load `people`/`families`/`children` rồi
  serialize sang GEDCOM 5.5.1 bằng `src/lib/gedcom-export.ts`.
- Response: `text/plain` (`.ged`), `Content-Disposition: attachment`.

> ⚠️ Hiện `select('*')` không phân trang — đủ cho quy mô hiện tại, sẽ cần
> stream khi dữ liệu lớn (xem AUDIT_PLAN).

---

## 2. Supabase PostgREST API (Web Mode)

**Base URL:** `https://{PROJECT_REF}.supabase.co/rest/v1/`

**Headers chung:**
```
apikey: {SUPABASE_ANON_KEY}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
Prefer: return=representation          (khi cần trả về row đã insert/update)
Prefer: return=minimal                 (khi không cần response body)
```

---

### 2.1 People (Thành viên)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/people` | `?order=generation.asc,display_name.asc` |
| Get by ID | GET | `/rest/v1/people` | `?id=eq.{uuid}&limit=1` |
| Get by handle | GET | `/rest/v1/people` | `?handle=eq.{handle}&limit=1` |
| Search | GET | `/rest/v1/people` | `?display_name=ilike.*{query}*&limit=20` |
| By generation | GET | `/rest/v1/people` | `?generation=eq.{n}&order=display_name.asc` |
| Create | POST | `/rest/v1/people` | JSON body (CreatePersonInput) |
| Update | PATCH | `/rest/v1/people` | `?id=eq.{uuid}` + JSON body |
| Delete | DELETE | `/rest/v1/people` | `?id=eq.{uuid}` |

**CreatePersonInput:**
```json
{
  "handle": "le-sy-a",          // required, unique slug
  "display_name": "Lê Sỹ A",    // required
  "first_name": "A",
  "middle_name": "Đình",
  "surname": "Đặng",
  "pen_name": "Tên tự",
  "taboo_name": "Tên húy",
  "gender": 1,                       // 1=Nam, 2=Nữ
  "generation": 3,                   // required
  "chi": 1,
  "birth_date": "1950-01-15",
  "birth_year": 1950,
  "birth_place": "Thanh Hóa",
  "death_date": null,
  "death_year": null,
  "death_place": null,
  "death_lunar": "15/7",
  "is_living": true,
  "is_patrilineal": true,
  "phone": "0901234567",
  "email": "user@example.com",
  "zalo": "0901234567",
  "facebook": "https://fb.com/user",
  "address": "Thường Xuân, Thanh Hóa",
  "hometown": "Thanh Hóa",
  "occupation": "Nông dân",
  "biography": "...",
  "notes": "...",
  "avatar_url": "https://...",
  "privacy_level": 1                 // 0=public, 1=members, 2=private
}
```

---

### 2.2 Families (Gia đình)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/families` | `?order=sort_order.asc` |
| Get by ID | GET | `/rest/v1/families` | `?id=eq.{uuid}` |
| Get by parents | GET | `/rest/v1/families` | `?father_id=eq.{uuid}&mother_id=eq.{uuid}` |
| Create | POST | `/rest/v1/families` | JSON body |
| Update | PATCH | `/rest/v1/families` | `?id=eq.{uuid}` + JSON body |

**Family body:**
```json
{
  "handle": "fam-1234-abcd",
  "father_id": "uuid",
  "mother_id": "uuid",
  "marriage_date": "1975-02-15",
  "marriage_place": "Thanh Hóa",
  "divorce_date": null,
  "notes": null,
  "sort_order": 0
}
```

---

### 2.3 Children (Quan hệ cha mẹ-con)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| Get by family | GET | `/rest/v1/children` | `?family_id=eq.{uuid}&order=sort_order.asc` |
| Get by person | GET | `/rest/v1/children` | `?person_id=eq.{uuid}` |
| Add child | POST | `/rest/v1/children` | `{ family_id, person_id, sort_order }` |
| Remove child | DELETE | `/rest/v1/children` | `?family_id=eq.{uuid}&person_id=eq.{uuid}` |

---

### 2.4 Profiles (Tài khoản người dùng)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| Get by user_id | GET | `/rest/v1/profiles` | `?user_id=eq.{uuid}` |
| List all | GET | `/rest/v1/profiles` | `?order=created_at.desc` |
| Update profile | PATCH | `/rest/v1/profiles` | `?user_id=eq.{uuid}` + body |
| Update role | PATCH | `/rest/v1/profiles` | `?user_id=eq.{uuid}` + `{ role }` |
| Link person | PATCH | `/rest/v1/profiles` | `?user_id=eq.{uuid}` + `{ linked_person }` |

**Profile update body:**
```json
{
  "full_name": "Nguyễn Văn A",
  "role": "admin | editor | viewer",
  "linked_person": "uuid | null",
  "edit_root_person_id": "uuid | null",
  "avatar_url": "https://..."
}
```

---

### 2.5 Contributions (Đề xuất chỉnh sửa)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/contributions` | `?order=created_at.desc` |
| Filter by status | GET | `/rest/v1/contributions` | `?status=eq.pending` |
| By person | GET | `/rest/v1/contributions` | `?target_person=eq.{uuid}` |
| Create | POST | `/rest/v1/contributions` | JSON body |
| Review (approve/reject) | PATCH | `/rest/v1/contributions` | `?id=eq.{uuid}` + body |

**Create body:**
```json
{
  "author_id": "uuid",
  "target_person": "uuid",
  "change_type": "create | update | delete",
  "changes": { "field": "new_value" },
  "reason": "Lý do đề xuất"
}
```

**Review body:**
```json
{
  "status": "approved | rejected",
  "reviewed_by": "uuid",
  "reviewed_at": "2026-02-27T10:00:00Z",
  "review_notes": "Đã kiểm tra và xác nhận"
}
```

---

### 2.6 Events (Lịch sự kiện / Ngày giỗ)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/events` | `?order=event_date.asc` |
| By type | GET | `/rest/v1/events` | `?event_type=eq.gio` |
| Create | POST | `/rest/v1/events` | JSON body |
| Update | PATCH | `/rest/v1/events` | `?id=eq.{uuid}` + body |
| Delete | DELETE | `/rest/v1/events` | `?id=eq.{uuid}` |

**Event body:**
```json
{
  "title": "Giỗ tổ Chi 1",
  "description": "...",
  "event_date": "2026-03-15",
  "event_lunar": "15/2",
  "event_type": "gio | hop_ho | le_tet | other",
  "person_id": "uuid",
  "location": "Nhà thờ họ",
  "recurring": true
}
```

---

### 2.7 Media (Ảnh & Tài liệu người)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| By person | GET | `/rest/v1/media` | `?person_id=eq.{uuid}&order=sort_order.asc` |
| Create | POST | `/rest/v1/media` | JSON body |
| Update | PATCH | `/rest/v1/media` | `?id=eq.{uuid}` + body |
| Delete | DELETE | `/rest/v1/media` | `?id=eq.{uuid}` |
| Set primary | PATCH | `/rest/v1/media` | Two-step: reset all → set one |

**Media body:**
```json
{
  "person_id": "uuid",
  "type": "photo | document | video",
  "url": "https://...",
  "caption": "Ảnh chụp năm 1975",
  "is_primary": false,
  "sort_order": 0
}
```

**Supabase Storage upload:**
```
POST /storage/v1/object/media/avatars/{filename}
Content-Type: image/jpeg
Authorization: Bearer {JWT}

<binary>
```

---

### 2.8 Achievements (Vinh danh thành tích)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/achievements` | `?order=year.desc` |
| By category | GET | `/rest/v1/achievements` | `?category=eq.hoc_tap` |
| By person | GET | `/rest/v1/achievements` | `?person_id=eq.{uuid}&order=year.desc` |
| Featured | GET | `/rest/v1/achievements` | `?is_featured=eq.true&limit=6` |
| Create | POST | `/rest/v1/achievements` | JSON body |
| Update | PATCH | `/rest/v1/achievements` | `?id=eq.{uuid}` + body |
| Delete | DELETE | `/rest/v1/achievements` | `?id=eq.{uuid}` |

**Achievement body:**
```json
{
  "person_id": "uuid",
  "title": "Bằng khen cấp tỉnh",
  "category": "hoc_tap | su_nghiep | cong_hien | other",
  "description": "...",
  "year": 2025,
  "awarded_by": "UBND tỉnh Thanh Hóa",
  "is_featured": false
}
```

---

### 2.9 Fund Transactions (Quỹ khuyến học)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/fund_transactions` | `?order=transaction_date.desc` |
| By academic year | GET | `/rest/v1/fund_transactions` | `?academic_year=eq.2025-2026` |
| Balance summary | GET | `/rest/v1/fund_transactions` | `?select=type,amount&limit=5000` |
| Create | POST | `/rest/v1/fund_transactions` | JSON body |
| Update | PATCH | `/rest/v1/fund_transactions` | `?id=eq.{uuid}` + body |
| Delete | DELETE | `/rest/v1/fund_transactions` | `?id=eq.{uuid}` |

**FundTransaction body:**
```json
{
  "type": "income | expense",
  "category": "dong_gop | hoc_bong | khen_thuong | other",
  "amount": 1000000,
  "donor_name": "Nguyễn Văn A",
  "donor_person_id": "uuid",
  "recipient_id": "uuid",
  "description": "Đóng góp quỹ 2026",
  "transaction_date": "2026-02-27",
  "academic_year": "2025-2026",
  "created_by": "uuid"
}
```

---

### 2.10 Scholarships (Học bổng & Khen thưởng)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/scholarships` | `?order=created_at.desc` |
| By academic year | GET | `/rest/v1/scholarships` | `?academic_year=eq.2025-2026` |
| Create | POST | `/rest/v1/scholarships` | JSON body |
| Update status | PATCH | `/rest/v1/scholarships` | `?id=eq.{uuid}` + `{ status, approved_by, approved_at }` |
| Delete | DELETE | `/rest/v1/scholarships` | `?id=eq.{uuid}` |

**Scholarship body:**
```json
{
  "person_id": "uuid",
  "type": "hoc_bong | khen_thuong",
  "amount": 500000,
  "reason": "Đạt học sinh giỏi",
  "academic_year": "2025-2026",
  "school": "THPT Lê Quý Đôn",
  "grade_level": "Lớp 12",
  "status": "pending | approved | paid"
}
```

---

### 2.11 Clan Articles (Hương ước)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/clan_articles` | `?order=sort_order.asc` |
| By category | GET | `/rest/v1/clan_articles` | `?category=eq.gia_huan` |
| Featured | GET | `/rest/v1/clan_articles` | `?is_featured=eq.true` |
| Create | POST | `/rest/v1/clan_articles` | JSON body |
| Update | PATCH | `/rest/v1/clan_articles` | `?id=eq.{uuid}` + body |
| Delete | DELETE | `/rest/v1/clan_articles` | `?id=eq.{uuid}` |

**ClanArticle body:**
```json
{
  "title": "Gia huấn khai niên",
  "content": "Nội dung hương ước...",
  "category": "gia_huan | quy_uoc | loi_dan",
  "sort_order": 1,
  "is_featured": false,
  "author_id": "uuid"
}
```

---

### 2.12 Clan Documents (Kho tài liệu)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/clan_documents` | `?order=created_at.desc` |
| By category | GET | `/rest/v1/clan_documents` | `?category=eq.anh_lich_su` |
| Search by title | GET | `/rest/v1/clan_documents` | `?title=ilike.*query*` |
| By person | GET | `/rest/v1/clan_documents` | `?person_id=eq.{uuid}` |
| Get by ID | GET | `/rest/v1/clan_documents` | `?id=eq.{uuid}` |
| Create | POST | `/rest/v1/clan_documents` | JSON body |
| Update | PATCH | `/rest/v1/clan_documents` | `?id=eq.{uuid}` + body |
| Delete | DELETE | `/rest/v1/clan_documents` | `?id=eq.{uuid}` |

**ClanDocument body:**
```json
{
  "title": "Ảnh làng Thường Xuân 1975",
  "description": "Ảnh lịch sử của làng",
  "file_url": "https://...supabase.co/storage/v1/object/public/media/documents/...",
  "file_type": "image/jpeg",
  "file_size": 204800,
  "category": "anh_lich_su | giay_to | ban_do | video | bai_viet | khac",
  "privacy_level": 1,
  "tags": "lich-su,lang,1975",
  "person_id": "uuid",
  "uploaded_by": "uuid"
}
```

**Document privacy_level access matrix (v2.3.1):**

| Role | privacy_level=0 (public) | privacy_level=1 (members) | privacy_level=2 (restricted) |
|------|--------------------------|---------------------------|-------------------------------|
| anonymous | ✗ (login required) | ✗ | ✗ |
| viewer | ✓ | ✗ | ✗ |
| editor | ✓ | ✓ | ✓ |
| admin | ✓ | ✓ | ✓ |

> **v2.3.1 fix** (`20260301000012`): `privacy_level=1` documents restricted to editor/admin roles only. Previously all authenticated users (incl. viewer) could read level 1 docs.

---

### 2.13 Cầu Đương Pools (Nhóm xoay vòng)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List active | GET | `/rest/v1/cau_duong_pools` | `?is_active=eq.true&order=created_at.asc` |
| Get by ID | GET | `/rest/v1/cau_duong_pools` | `?id=eq.{uuid}` |
| Create | POST | `/rest/v1/cau_duong_pools` | JSON body |
| Update | PATCH | `/rest/v1/cau_duong_pools` | `?id=eq.{uuid}` + body |

**Pool body:**
```json
{
  "name": "Nhóm Cầu đương Chi 1",
  "ancestor_id": "uuid",
  "min_generation": 3,
  "max_age_lunar": 70,
  "description": "...",
  "is_active": true
}
```

---

### 2.14 Cầu Đương Assignments (Phân công lễ)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| By pool | GET | `/rest/v1/cau_duong_assignments` | `?pool_id=eq.{uuid}&order=year.desc` |
| By pool + year | GET | `/rest/v1/cau_duong_assignments` | `?pool_id=eq.{uuid}&year=eq.2026` |
| Create | POST | `/rest/v1/cau_duong_assignments` | JSON body |
| Update | PATCH | `/rest/v1/cau_duong_assignments` | `?id=eq.{uuid}` + body |

**Assignment body:**
```json
{
  "pool_id": "uuid",
  "year": 2026,
  "ceremony_type": "tet | ram_thang_gieng | gio_to | ram_thang_bay",
  "host_person_id": "uuid",
  "actual_host_person_id": "uuid",
  "status": "scheduled | completed | delegated | rescheduled | cancelled",
  "scheduled_date": "2026-01-29",
  "actual_date": null,
  "reason": "...",
  "notes": "...",
  "rotation_index": 5,
  "created_by": "uuid"
}
```

---

### 2.15 Member Registrations (Đăng ký thành viên)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| List all | GET | `/rest/v1/member_registrations` | `?order=created_at.desc` |
| Filter by status | GET | `/rest/v1/member_registrations` | `?status=eq.pending` |
| Create (public form) | POST | `/rest/v1/member_registrations` | JSON body |
| Review | PATCH | `/rest/v1/member_registrations` | `?id=eq.{uuid}` + body |

> Public submit từ `/register-member` (rate-limited ở proxy: 3 lần/giờ/IP);
> admin duyệt tại `/admin/registrations`.

### 2.16 Notifications

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| By user | GET | `/rest/v1/notifications` | `?user_id=eq.{uid}&order=created_at.desc` |
| Mark read | PATCH | `/rest/v1/notifications` | `?id=eq.{uuid}` + `{ is_read: true }` |

> Được tạo tự động bởi DB triggers `notify_post_like` / `notify_post_comment`
> khi có tương tác trên feed.

### 2.17 Feed (Posts / Comments / Likes)

| Table | Operation | Method | Path |
|-------|-----------|--------|------|
| posts | List (published) | GET | `/rest/v1/posts?status=eq.published&order=created_at.desc` |
| posts | Create/Update/Delete | POST/PATCH/DELETE | `/rest/v1/posts` |
| post_comments | By post + create | GET/POST | `/rest/v1/post_comments` |
| post_likes | Toggle like | POST/DELETE | `/rest/v1/post_likes` |

> `posts.comments_count` / `posts.likes_count` được duy trì bởi triggers
> `update_post_comments_count` / `update_post_likes_count`. Ảnh bài viết lưu
> trong bucket `media` (path `posts/`). Admin kiểm duyệt tại `/admin/feed`.

### 2.18 Clan Settings (Cấu hình dòng họ)

| Operation | Method | Path | Params / Body |
|-----------|--------|------|---------------|
| Get settings | GET | `/rest/v1/clan_settings` | `?id=eq.1&limit=1` (singleton row) |
| Update | PATCH | `/rest/v1/clan_settings` | `?id=eq.1` + body (admin only) |

> Nguồn dữ liệu cho trang bìa PDF export, trang `/council`, `/ancestral-hall`.

### 2.19 RPC Functions

| Function | Dùng ở | Mô tả |
|----------|--------|--------|
| `is_person_in_subtree(root_id, target_id)` | editor scope check | `true/false` — target nằm trong nhánh của root |
| `search_people_filtered(...)` | `/people` search | Tìm kiếm + lọc người (phân trang server-side) |
| `search_people_advanced(...)` | `/people` advanced search | Tìm kiếm nâng cao nhiều tiêu chí |
| `get_people_filter_options()` | `/people` filters | Danh sách generation/chi distinct cho dropdown |
| `get_people_stats()` | `/stats`, dashboard | Số liệu tổng quan (tổng, sống/mất, giới tính) |
| `get_fund_balance()` | `/fund` | Số dư quỹ khuyến học |
| `is_admin()` / `is_admin_or_editor()` / `is_verified_user()` | RLS policies | Helper phân quyền dùng trong policy |
| `owns_person_media_path(path)` | Storage RLS | Check quyền sở hữu file media |
| `handle_new_user()` | Auth trigger | Tự tạo `profiles` row sau signup |
| `notify_post_like()` / `notify_post_comment()` | DB triggers | Tạo notification khi có like/comment |
| `update_post_likes_count()` / `update_post_comments_count()` | DB triggers | Duy trì counter trên `posts` |

**`is_person_in_subtree` request:**
```json
{
  "root_id": "uuid",
  "target_id": "uuid"
}
```

**Response:** `true | false`

---

## 3. Supabase Auth API

**Base URL:** `https://{PROJECT_REF}.supabase.co/auth/v1/`

| Operation | Method | Path | Body |
|-----------|--------|------|------|
| Đăng ký | POST | `/auth/v1/signup` | `{ email, password }` |
| Đăng nhập | POST | `/auth/v1/token?grant_type=password` | `{ email, password }` |
| Đăng xuất | POST | `/auth/v1/logout` | (auth header) |
| Quên mật khẩu | POST | `/auth/v1/recover` | `{ email }` |
| Đổi mật khẩu | PUT | `/auth/v1/user` | `{ password }` + auth header |
| Lấy user hiện tại + factors | GET | `/auth/v1/user` | (auth header) |
| Đổi thông tin user | PUT | `/auth/v1/user` | `{ password, data }` + auth header |

### 3.1 MFA / TOTP (GoTrue v2.186.0)

> **Yêu cầu:** `[auth.mfa]` phải được bật trong `supabase/config.toml`.
> **Lưu ý GoTrue v2.186.0:** `GET /auth/v1/factors` không tồn tại (405). Danh sách factors lấy từ `GET /auth/v1/user → .factors[]`. Endpoint `/auth/v1/aal` không tồn tại (404); AAL đọc từ JWT payload claim `aal`.

| Operation | Method | Path | Body / Notes |
|-----------|--------|------|--------------|
| Enroll TOTP factor | POST | `/auth/v1/factors` | `{ factor_type: "totp", issuer, friendly_name }` |
| Unenroll factor | DELETE | `/auth/v1/factors/:id` | (auth header) |
| Create challenge | POST | `/auth/v1/factors/:id/challenge` | `{}` |
| Verify challenge | POST | `/auth/v1/factors/:id/verify` | `{ challenge_id, code }` |
| List factors | GET | `/auth/v1/user` | Response: `{ ..., factors: [{id, status, friendly_name, factor_type}] }` |
| Get AAL | (from JWT) | — | JWT payload field `aal`: `"aal1"` \| `"aal2"` |

**Response — enroll:**
```json
{
  "id": "uuid",
  "type": "totp",
  "totp": {
    "qr_code": "data:image/svg+xml;base64,...",
    "secret": "BASE32SECRET",
    "uri": "otpauth://totp/..."
  }
}
```

> ⚠️ Lưu ý: test suite `mfa-account.test.ts` từng tồn tại nhưng đã bị xóa
> cùng desktop code; hiện repo không còn file test nào (xem CODEBASE-AUDIT §2 P2.3).

### 3.2 User Management (Profiles)

> **Profiles table:** column `user_id` = auth UID (NOT `profiles.id` which is the profile's own UUID).

| Operation | Endpoint | Auth |
|-----------|----------|------|
| Fetch own profile | `GET /rest/v1/profiles?user_id=eq.{uid}` | anon_key + Bearer |
| Update own profile | `PATCH /rest/v1/profiles?user_id=eq.{uid}` | anon_key + Bearer |
| Suspend user | `PATCH /rest/v1/profiles?user_id=eq.{uid}` `{ is_suspended: true, suspension_reason: "..." }` | service_role |
| Unsuspend user | `PATCH /rest/v1/profiles?user_id=eq.{uid}` `{ is_suspended: false, suspension_reason: null }` | service_role |
| Delete user (Auth) | Server Action `deleteUserAccount(userId)` | service_role admin API |

**config.toml required (local dev):**
```toml
[auth.mfa]
max_enrolled_factors = 10

[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true
```

---

## 4. Supabase Storage API

**Base URL:** `https://{PROJECT_REF}.supabase.co/storage/v1/`

| Operation | Method | Path | Mô tả |
|-----------|--------|------|--------|
| Upload | POST | `/storage/v1/object/media/{path}` | Multipart form |
| Get public URL | GET | `/storage/v1/object/public/media/{path}` | Public access |
| Delete | DELETE | `/storage/v1/object/media` | Body: `{ prefixes: [path] }` |

**Bucket:** `media`
**Allowed types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`, `video/mp4`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

## 5. RLS Roles Summary

| Role | people (R) | people (W) | families | profiles | admin routes |
|------|-----------|-----------|----------|----------|--------------|
| Anonymous | public, no-contact only | ✗ | ✗ | ✗ | ✗ |
| viewer | privacy_level < 2 | ✗ | ✓ | ✓ (own) | ✗ |
| editor | privacy_level < 2 | ✓ | ✓ | ✓ (own) | ✓ |
| admin | all | ✓ | ✓ | ✓ | ✓ |

---

## 6. PDF Export — Client-side Library (`src/lib/pdf-export.ts`)

> **✅ Status 2026-09: ĐÃ WIRE.** Lib được gọi từ tree toolbar
> (`family-tree-toolbar.tsx` → `family-tree.tsx`) và `/admin/export`
> (`admin-export-view.tsx`). Giữ **ngoài barrel `@lib`** (import trực tiếp
> `next/dynamic`) để `jspdf`/`html2canvas` không lọt vào bundle chung.
>
> **Kiến trúc:** Toàn bộ xử lý PDF diễn ra **phía client** (browser), không có API route server-side.
> **Dependencies:** `jspdf@^4.2.0`, `html2canvas@^1.4.1`

### 6.1 Hàm `exportTreeToPdf()` — Xuất cây gia phả

Xuất sơ đồ phả hệ SVG sang PDF (A2/A3/A4 ngang).

**Signature:**
```typescript
exportTreeToPdf(
  containerElement: HTMLElement,  // phần tử chứa <svg>
  treeWidth: number,
  treeHeight: number,
  offsetX: number,
  options?: PdfExportOptions,
): Promise<void>
```

**Options:**
| Tham số | Mặc định | Mô tả |
|---------|----------|--------|
| `filename` | `gia-pha-cay-YYYY-MM-DD.pdf` | Tên file |
| `orientation` | `'landscape'` | Hướng trang |
| `pageSize` | `'a3'` | Kích thước trang (`a4`/`a3`/`a2`) |

**Chiến lược:** SVG → Blob URL → HTMLImageElement → Canvas (2× DPI) → PNG → jsPDF

---

### 6.2 Hàm `exportFullGiaPha()` — Xuất Gia Phả đầy đủ

Xuất tài liệu PDF đa trang A4 gồm trang bìa, lịch sử, cây phả hệ và lý lịch thành viên.

**Signature:**
```typescript
exportFullGiaPha(
  containerElement: HTMLElement,
  treeWidth: number,
  treeHeight: number,
  offsetX: number,
  treeData: TreeData,
  clanSettings: ClanSettings | null,
  sectionOptions?: FullGiaPhaOptions,
): Promise<void>
```

**Cấu trúc PDF đầu ra:**

| Thứ tự | Trang | Định hướng | Nội dung | Điều kiện |
|--------|-------|-----------|---------|-----------|
| 1 | Trang bìa | Portrait A4 | Tên dòng họ, thủy tổ, năm thành lập, nguồn gốc, liên hệ | `includeCover = true` |
| 2 | Lịch sử & Nguồn gốc | Portrait A4 | Mô tả, lịch sử, sứ mệnh, nhà thờ họ | `includeHistory = true` + có nội dung |
| 3 | Cây gia phả | Landscape A4 | Sơ đồ SVG → PNG | `includeTree = true` |
| 4+ | Lý lịch thành viên | Portrait A4 | Tất cả thành viên nhóm theo đời (tự động phân trang) | `includeBiographies = true` |

**`FullGiaPhaOptions` (mặc định: tất cả `true`):**
```typescript
interface FullGiaPhaOptions {
  includeCover: boolean;       // Trang bìa
  includeHistory: boolean;     // Lịch sử & nguồn gốc
  includeTree: boolean;        // Cây gia phả (A4 ngang)
  includeBiographies: boolean; // Lý lịch thành viên
}
```

**Cơ chế render Vietnamese:**
- **Trang văn bản** (bìa, lịch sử, lý lịch): `html2canvas` render HTML → canvas → PNG
  - Hỗ trợ toàn bộ ký tự Unicode (tiếng Việt có dấu)
  - Canvas tự động chia thành A4-slice khi nội dung cao hơn 1 trang
- **Trang cây phả hệ**: SVG clone → Blob URL → HTMLImageElement → Canvas

**Trigger:** Nút "Xuất Gia Phả" trong controls bar của `FamilyTree` (chỉ desktop, `admin|editor`)

---

### 6.3 Hàm `getExportWarning()` — Cảnh báo kích thước

```typescript
getExportWarning(nodeCount: number): string | null
// > 50 người: toast info
// > 100 người: chặn xuất, yêu cầu lọc nhánh trước
```

---

### 6.4 UX Flow — Xuất Gia Phả

```
Người dùng click "Xuất Gia Phả"
  → Dialog mở (chọn trang: bìa / lịch sử / cây / lý lịch)
  → Click "Xuất PDF"
    → exportFullGiaPha() chạy tuần tự:
       1. htmlToCanvas(cover)   → pdf.addImage()
       2. htmlToCanvas(history) → sliceCanvasToPages()
       3. svgToCanvas(tree)     → pdf.addImage() (landscape)
       4. htmlToCanvas(bio)     → sliceCanvasToPages()
    → pdf.save("gia-pha-day-du-YYYY-MM-DD.pdf")
```

**Thời gian ước tính:**
- Cây < 30 người: ~5–10 giây
- Cây 30–100 người: ~15–30 giây
- Cây > 100 người: không khuyến khích (lọc nhánh trước)

---

## 7. Word Export — Client-side Library (`src/lib/word-export.ts`)

> **✅ Status 2026-09: ĐÃ IMPLEMENT.** `src/lib/word-export.ts` tồn tại và
> được gọi từ `/admin/export`; deps `docx@^9.7.1` + `file-saver@^2.0.5` đã cài.
>
> **Kiến trúc:** Xử lý hoàn toàn **phía client** (browser), không gọi API server.
> **Dependencies:** `docx@^9.7.1`, `file-saver@^2.0.5`
> **Định dạng đầu ra:** Microsoft Word `.docx` (Open XML), tương thích Word/LibreOffice/Google Docs.

### 7.1 Hàm `exportFullGiaPhaWord()` — Xuất Gia Phả đầy đủ ra Word

Xuất tài liệu Word (.docx) đa section gồm trang bìa, lịch sử, cây phả hệ và lý lịch thành viên. Có thể chỉnh sửa lại sau khi tải về, phù hợp lưu trữ và in ấn.

**Signature:**
```typescript
exportFullGiaPhaWord(
  containerElement: HTMLElement | null, // phần tử chứa <svg> cây phả hệ
  treeWidth: number,
  treeHeight: number,
  offsetX: number,
  treeData: TreeDataInput,
  clanSettings: ClanSettings | null,
  sectionOptions?: FullGiaPhaWordOptions,
): Promise<void>
```

**`FullGiaPhaWordOptions` (mặc định: tất cả `true`):**
```typescript
interface FullGiaPhaWordOptions {
  includeCover: boolean;       // Trang bìa
  includeHistory: boolean;     // Lịch sử & nguồn gốc
  includeTree: boolean;        // Cây gia phả (A4 ngang, ảnh PNG chèn)
  includeBiographies: boolean; // Lý lịch từng thành viên nhóm theo đời
}
```

### 7.2 Cấu trúc file .docx đầu ra

Mỗi phần được xuất là một **Word section** riêng — kiểm soát định hướng trang và margin độc lập.

| Thứ tự | Section | Khổ giấy | Định hướng | Margin | Nội dung |
|--------|---------|---------|-----------|--------|---------|
| 1 | Trang bìa | A4 (210×297mm) | Portrait | 20mm | Tên dòng họ, thủy tổ, năm thành lập, nguồn gốc, liên hệ |
| 2 | Lịch sử & Nguồn gốc | A4 | Portrait | 20mm | Mô tả, lịch sử, sứ mệnh, nhà thờ họ (justify, Times New Roman) |
| 3 | Cây gia phả | A4 (297×210mm) | **Landscape** | 15mm | Ảnh PNG sơ đồ phả hệ (kích thước tự co giãn giữ tỉ lệ) |
| 4 | Lý lịch thành viên | A4 | Portrait | 20mm | Bảng thống kê + thẻ (card) từng thành viên nhóm theo đời |

**Header / Footer** (từ section 2 trở đi):
- **Header:** Tên dòng họ (canh phải, viền dưới amber)
- **Footer:** `AncestorTree · Xuất ngày YYYY-MM-DD | Trang X / Y`

### 7.3 Tông màu (đồng bộ với PDF export)

| Vai trò | Mã hex | Sử dụng |
|--------|-------|--------|
| Amber-700 | `#B45309` | Nhấn (accent), viền dưới tiêu đề |
| Amber-900 | `#78350F` | Tiêu đề bìa, banner đời |
| Amber-100 | `#FEF3C7` | Nền bảng thống kê |
| Blue-50 / Blue-300 | `#EFF6FF` / `#93C5FD` | Thẻ thành viên nam |
| Pink-50 / Pink-300 | `#FFF1F2` / `#FDA4AF` | Thẻ thành viên nữ |
| Stone-900 | `#1C1917` | Text body |
| Stone-500 | `#78716C` | Label |

Toàn bộ text dùng font **Times New Roman** (cỡ 12pt body, 15pt section title, 28pt title).

### 7.4 Cơ chế render cây gia phả

Cùng chiến lược với PDF export:

```
SVG (in-DOM)
  → clone + reset transform + set full viewBox
  → XMLSerializer → Blob URL
  → HTMLImageElement.onload
  → Canvas 2× DPI → PNG dataURL
  → fetch(dataURL) → ArrayBuffer
  → docx.ImageRun { type: 'png', data: ArrayBuffer, transformation: {w,h} }
```

Ảnh chèn vào trang A4 landscape, tự động co giãn giữ tỉ lệ trong vùng usable **1010×640 px** (~26.7×17.0 cm).

### 7.5 Trigger UI

**Nút:** "Xuất Gia Phả Word" trong `FamilyTree` toolbar (icon `FileText` màu xanh dương).

**Flow:**
```
Click "Xuất Gia Phả Word"
  → Dialog Word mở (chọn phần: bìa / lịch sử / cây / lý lịch)
  → Click "Xuất Word"
    → exportFullGiaPhaWord() chạy tuần tự:
       1. buildCoverSection()      → docx section (portrait)
       2. buildHistorySection()    → docx section (portrait, có header/footer)
       3. svgToPng() + ImageRun    → docx section (landscape)
       4. buildBiographySection()  → docx section (portrait, stats + card từng đời)
    → Packer.toBlob(doc)
    → saveAs(blob, "gia-pha-day-du-YYYY-MM-DD.docx")
```

### 7.6 Bảo mật (client-side)

- **Không có endpoint server-side** — file được tạo hoàn toàn trong browser, không dữ liệu rời máy client.
- Kế thừa RLS: `useTreeData()` chỉ trả về `people` mà user hiện tại được quyền đọc → export tự động lọc theo role/privacy_level.
- Ảnh cây phả hệ chỉ hiển thị tên/ngày (không PII contact), do TreeNode SVG render không bao gồm phone/email/address.
- Kích thước file: xấp xỉ 100–300 KB (< 30 người) → 500–800 KB (30–100 người). Không phát hành ra ngoài.
- Cảnh báo kích thước dùng chung `getExportWarning()` với PDF export (chặn ở > 100 người, cảnh báo ở > 50).
