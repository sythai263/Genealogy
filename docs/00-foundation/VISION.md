---
project: AncestorTree
path: docs/00-foundation/VISION.md
type: foundation
version: 3.1.0
updated: 2026-09-16
owner: "@pm, @cto"
status: approved
---

# Vision & Scope

## 1. Project Vision

**Gia Phả Điện Tử** (AncestorTree) là nền tảng quản lý gia phả số hóa **miễn phí, mã nguồn mở**, được xây dựng đặc biệt cho văn hóa Việt Nam.

> **Tầm nhìn:** Mỗi dòng họ Việt Nam đều có thể số hóa, bảo tồn và chia sẻ gia phả của mình — miễn phí, dễ dùng, và tôn trọng truyền thống văn hóa.

### 1.1 Mission

- **Bảo tồn:** Số hóa 100% thông tin gia phả, chống thất lạc qua thời gian
- **Kết nối:** Tạo cầu nối giữa các thế hệ, các chi nhánh trong dòng họ
- **Cộng đồng:** Cung cấp giải pháp mở cho mọi dòng họ Việt Nam tái sử dụng

### 1.2 Core Values

| Giá trị | Ý nghĩa |
|---------|---------|
| **Tôn trọng truyền thống** | Hỗ trợ âm lịch, ngày giỗ, can chi, chi/nhánh, đời |
| **Đơn giản, dễ dùng** | Thiết kế cho mọi lứa tuổi, từ cao tuổi đến giới trẻ |
| **Miễn phí hoàn toàn** | $0/tháng, sử dụng free tier (Supabase + Vercel) |
| **Mã nguồn mở** | MIT license, cộng đồng có thể fork và sử dụng |
| **Bảo mật dữ liệu** | Phân quyền, mã hóa, kiểm soát riêng tư |

---

## 2. Target Users

### 2.1 Primary User: Họ Đặng làng Kỷ Các

Họ Đặng làng Kỷ Các — dòng họ đầu tiên sử dụng hệ thống.

### 2.2 User Personas

| Persona | Mô tả | Nhu cầu chính | Khả năng kỹ thuật |
|---------|--------|---------------|-------------------|
| **Chủ tịch HĐGT** | Nam, 60-70 tuổi, lãnh đạo dòng họ | Quản lý tập trung, báo cáo thống kê | Thấp — cần giao diện đơn giản |
| **Ban Chấp hành** | Nam/Nữ, 40-60 tuổi, quản lý chi nhánh | Cập nhật thông tin, duyệt đề xuất | Trung bình — quen smartphone |
| **Thành viên trẻ** | Nam/Nữ, 20-40 tuổi, con cháu | Tra cứu, xem cây gia phả, đóng góp | Cao — thành thạo công nghệ |
| **Việt kiều** | Nam/Nữ, mọi lứa tuổi, ở nước ngoài | Kết nối với quê hương, tra cứu gốc gác | Cao — truy cập từ xa |
| **Cộng đồng OSS** | Developer, dòng họ khác | Fork, customize cho dòng họ mình | Cao — kỹ thuật |

### 2.3 Secondary Users

- **Cộng đồng Việt Nam:** ~54 họ lớn, ~10,000 hội đồng gia tộc có thể tái sử dụng
- **Nghiên cứu gia phả:** Nhà nghiên cứu lịch sử, văn hóa dòng họ

---

## 3. Scope

### 3.1 Delivered (v0.1.0 – v2.1.0) ✅

| Version | Features | Sprint |
|---------|----------|--------|
| **v0.1.0 Alpha** | Project setup, Database, Auth, Layout | Sprint 1 |
| **v0.5.0 Beta** | People CRUD, Family relationships, Basic tree, Search | Sprint 2 |
| **v1.0.0 MVP** | Interactive tree, Admin panel, Homepage, Deploy | Sprint 3 |
| **v1.1.0 Enhanced** | Directory, Memorial calendar, Lunar dates, Contributions | Sprint 4 |
| **v1.2.0 Release** | GEDCOM export, Book generator, Photos, Polish | Sprint 5 |
| **v1.3.0 Culture** | Achievement honors, Education fund, Family charter | Sprint 6 |
| **v1.4.0 Ceremony** | Cầu đương — DFS rotation algorithm | Sprint 7 |
| **v1.5.0 Relations** | Family Relations UX, Tree hierarchical layout | Sprint 7.5 |
| **v1.6.0 Local Dev** | Supabase CLI + Docker, zero-config local mode | Sprint 8 |
| **v1.7.0 Security** | RLS hardening, privacy defaults, contact protection | Sprint 8B |
| ~~**v2.0.0 Desktop**~~ | ~~Electron + sql.js standalone app~~ — **đã gỡ 2026-09** (pure web per CLAUDE.md v3) | Sprint 9 |
| **v2.1.0 Landing** | Public landing page, SEO, community funnel | Sprint 10 |
| **v2.2.0 Kho tài liệu** | Document library, `/documents/library` | Sprint 11 |
| **v2.3.0 Privacy & Users** | User management, roles, verification | Sprint 12 |
| **v2.4.0 Góc giao lưu** | Feed posts/comments/likes + admin moderation | Sprint 15 |
| **v2.5.0 Thông báo** | In-app notifications (`/notifications`, bell) | Sprint 16 |
| **v3.0.0 Cộng đồng** | `/ancestral-hall`, `/council`, `/register-member`, `/family-tree` public, i18n vi+en | Sprint 18 |

### 3.2 Planned / Known Gaps 📋

| Item | Trạng thái | Nguồn |
|------|------------|-------|
| Backup export/restore (`/api/backup`, `/api/backup/restore`) | ❌ Đang hỏng (500 / 501) — xem [CODEBASE-AUDIT](../CODEBASE-AUDIT.md) §2 P0 | Audit 2026-09 |
| Word export (.docx) | ❌ Spec only — chưa implement | API-ENDPOINTS §7 |
| PDF export | ⚠️ Lib có sẵn nhưng chưa wire UI (dead code) | Audit 2026-09 |
| Email nhắc ngày giỗ | ❌ Chưa có (chỉ in-app notifications) | Sprint 16 spec |
| PWA, cross-clan | 📋 Chưa làm | Tầm nhìn dài hạn |

### 3.3 Out of Scope

- DNA/genetic testing integration
- Native mobile app iOS/Android (xem xét PWA trước)
- BOT hỗ trợ nhập liệu (AI chatbot)
- Real-time video call

---

## 4. Success Criteria

### 4.1 Business Success

| Metric | Target | Timeline |
|--------|--------|----------|
| **User Adoption** | 50+ registered users | 3 tháng |
| **Data Entries** | 200+ people records | 3 tháng |
| **Admin Trained** | 3+ admins | 3 tháng |
| **Data Accuracy** | >95% (reviewed by HĐGT) | 6 tháng |
| **Community Reuse** | >5 dòng họ fork/deploy | 12 tháng |

### 4.2 Technical Success

| Metric | Target |
|--------|--------|
| **Uptime** | >99% |
| **Page Load** | <3 seconds |
| **Lighthouse Score** | >90 (all categories) |
| **Monthly Cost** | $0 |
| **Mobile Responsive** | 100% |

---

## 5. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 16, React 19 | SSR, App Router, Vercel native |
| **Language** | TypeScript 5 | Type safety, maintainability |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Modern, accessible, responsive |
| **Database** | Supabase (PostgreSQL) | Free tier, Auth, Storage, RLS |
| **Deployment** | Vercel | Free, auto-deploy, Edge CDN |
| **State** | Zustand + React Query | Simple state + server cache |

---

## 6. Team & Resources

| Role | Allocation | Responsibility |
|------|:----------:|----------------|
| **@pm** | 20% | Planning, documentation, review |
| **@fullstack** | 70% | Design, development, testing |
| **@researcher** | 10% | Market research, competitive analysis |

### Budget

| Item | Cost |
|------|------|
| Infrastructure (monthly) | $0 (free tier) |
| Domain (annual) | ~$10 |
| Development | AI-assisted (40-60h) |
| **Total** | **~$10 one-time** |

---

## 7. Timeline

```
Feb 24 ─────────── Mar 14 ──────────── Apr 4, 2026
  │ Sprint 1-3 (MVP)  │  Sprint 4-6 (Enhanced)  │
  │   Foundation       │  Directory, Calendar     │
  │   Core Data & Tree │  Contributions           │
  │   Interactive Tree │  GEDCOM, Book, Photos    │
  │   Admin & Deploy   │  Honors, Fund, Charter   │
  ▼                    ▼                          ▼
 v0.1.0             v1.0.0                     v1.3.0
```

---

## 8. Constraints & Dependencies

### 8.1 Constraints

| Constraint | Description |
|------------|-------------|
| **Budget** | $0/month — phải sử dụng free tier |
| **Platform** | Web-based, mobile responsive (không native app) |
| **Users** | Đa dạng lứa tuổi — UI phải đơn giản, dễ tiếp cận |
| **Privacy** | Thông tin nhạy cảm — cần phân quyền, mã hóa |
| **Scalability** | Có thể reuse cho dòng họ khác |

### 8.2 Dependencies

| Dependency | Service | Status |
|------------|---------|--------|
| Database & Auth | Supabase (free tier) | ✅ Available |
| Hosting & CDN | Vercel (free tier) | ✅ Available |
| Source Code | GitHub | ✅ Available |
| Genealogy Data | HĐGT cung cấp | ⏳ Pending |

---

## 9. Related Documents

| Document | Path | Stage |
|----------|------|-------|
| Problem Statement | [docs/00-foundation/problem-statement.md](./problem-statement.md) | 00 |
| Market Research | [docs/00-foundation/market-research.md](./market-research.md) | 00 |
| Business Case | [docs/00-foundation/business-case.md](./business-case.md) | 00 |
| Business Requirements | [docs/01-planning/BRD.md](../01-planning/BRD.md) | 01 |
| Project Roadmap | [docs/01-planning/roadmap.md](../01-planning/roadmap.md) | 01 |
| Technical Design | [docs/02-design/technical-design.md](../02-design/technical-design.md) | 02 |
| UI/UX Design | [docs/02-design/ui-ux-design.md](../02-design/ui-ux-design.md) | 02 |
| Sprint Plan | [docs/04-build/SPRINT-PLAN.md](../04-build/SPRINT-PLAN.md) | 04 |

---

## 10. Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| **Sponsor (CEO)** | - | ✅ Approved | 2026-02-25 |
| **CTO** | @cto | ✅ Approved | 2026-02-25 |
| **PM** | @pm | ✅ Approved | 2026-02-25 |

---

**Next:** [Problem Statement](./problem-statement.md)

*SDLC Framework 6.1.1 - Stage 00 Foundation*
