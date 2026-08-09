---
project: AncestorTree
path: docs/00-foundation/business-case.md
type: foundation
version: 1.0.0
updated: 2026-02-24
owner: "@pm, @researcher"
status: approved
---

# Business Case

## 1. Executive Summary

### 1.1 Opportunity

Xây dựng phần mềm gia phả điện tử **miễn phí, mã nguồn mở** phục vụ:
1. **Chi tộc Lê Sỹ** (Thanh Hóa) - Primary user
2. **Cộng đồng Việt Nam** - Các dòng họ khác có thể tái sử dụng

### 1.2 Value Proposition

| Stakeholder | Value |
|-------------|-------|
| **Chi tộc Lê Sỹ** | Số hóa, bảo tồn gia phả; Kết nối thành viên |
| **HĐGT** | Công cụ quản lý tập trung; Báo cáo thống kê |
| **Thành viên** | Tra cứu dễ dàng; Đóng góp thông tin |
| **Cộng đồng** | Giải pháp mở, miễn phí cho mọi dòng họ |

### 1.3 Recommendation

**GO** - Tiến hành dự án với:
- Budget: $0/month (free tier)
- Timeline: 4-6 tuần
- Team: 1 AI team (PM, Dev, Researcher)

---

## 2. Market Analysis

### 2.1 Existing Solutions

| Solution | Pros | Cons | Fit |
|----------|------|------|-----|
| **Ancestry.com** | Powerful, DNA integration | Paid, English-only, không hỗ trợ VN culture | ❌ |
| **MyHeritage** | Good tree view | Paid, thiếu features VN | ❌ |
| **FamilySearch** | Free, GEDCOM | Complex, không tiếng Việt | ⚠️ |
| **Gramps** | OSS, powerful | Desktop-only, learning curve cao | ⚠️ |
| **Excel/Word** | Quen thuộc | Không trực quan, khó chia sẻ | ❌ |

### 2.2 Gap Analysis

**Không có giải pháp nào đáp ứng đầy đủ:**
- ✅ Tiếng Việt 100%
- ✅ Web-based + Mobile responsive
- ✅ Miễn phí hoàn toàn
- ✅ Hỗ trợ văn hóa Việt (âm lịch, can chi, chi/nhánh)
- ✅ Open source cho cộng đồng

### 2.3 Target Market

| Segment | Size (Est.) | Potential |
|---------|-------------|-----------|
| **54 họ lớn Việt Nam** | 54 | Primary |
| **Hội đồng gia tộc** | ~10,000 | High |
| **Thành viên dòng họ** | ~50M | Medium |
| **Việt kiều** | ~5M | Medium |

---

## 3. Financial Analysis

### 3.1 Cost Structure

| Category | One-time | Monthly | Notes |
|----------|----------|---------|-------|
| **Infrastructure** | $0 | $0 | Supabase + Vercel free tier |
| **Domain** | ~$10/year | - | Optional |
| **Development** | 40-60h | - | AI-assisted |
| **Maintenance** | - | 2-4h | Ongoing |
| **Total** | ~$10 | ~$0 | |

### 3.2 Free Tier Limits

| Service | Free Limit | Est. Usage | Headroom |
|---------|------------|------------|----------|
| **Supabase DB** | 500MB | ~50MB | 10x |
| **Supabase Auth** | 50K MAU | ~500 | 100x |
| **Vercel** | 100GB BW | ~5GB | 20x |

### 3.3 Break-even Analysis

**Không áp dụng** - Dự án phi lợi nhuận, mã nguồn mở.

### 3.4 Value Delivered

| Metric | Value | Monetization |
|--------|-------|--------------|
| **Preservation** | Bảo tồn văn hóa | Priceless |
| **Efficiency** | Giảm 90% thời gian quản lý | Time saved |
| **Community** | Kết nối dòng họ | Social value |

---

## 4. Implementation Approach

### 4.1 Strategy: Rewrite with SDLC

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| **A: Fork existing** | Customize current repo | Fast | Limited, technical debt |
| **B: Rewrite** ✅ | Full SDLC, new codebase | Clean, extensible | More time |

**Selected:** Option B - Rewrite theo SDLC Framework

### 4.2 Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 0: Foundation** | 1 week | Problem Statement, Business Case |
| **Phase 1: Planning** | 1 week | BRD, Technical Design, Roadmap |
| **Phase 2: Build** | 2-3 weeks | Core features, MVP |
| **Phase 3: Deploy** | 1 week | Production deploy, documentation |
| **Phase 4: Operate** | Ongoing | Maintenance, community support |

### 4.3 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 15+ | SSR, performance, Vercel native |
| **Language** | TypeScript | Type safety, maintainability |
| **UI** | TailwindCSS + shadcn/ui | Modern, accessible |
| **Database** | Supabase (PostgreSQL) | Free, powerful, Auth included |
| **Deploy** | Vercel | Free, auto-deploy |
| **State** | Zustand | Simple, lightweight |

---

## 5. Risk Assessment

### 5.1 Risk Matrix

| Risk | Probability | Impact | Score | Mitigation |
|------|-------------|--------|-------|------------|
| **Low adoption** | Medium | High | 🟡 | Training, simple UI |
| **Data quality** | High | High | 🔴 | Review workflow |
| **Free tier exceeded** | Low | Medium | 🟢 | Monitor, upgrade path |
| **Security breach** | Low | High | 🟡 | RLS, encryption |
| **Maintainer burnout** | Medium | Medium | 🟡 | Documentation, community |

### 5.2 Mitigation Plan

| Risk | Strategy |
|------|----------|
| **Low adoption** | HĐGT training; Mobile-first UI; Gradual rollout |
| **Data quality** | Contribution workflow; Admin review; Audit log |
| **Security** | Row-level security; Role-based access; Privacy settings |

---

## 6. Success Metrics (KPIs)

### 6.1 Phase 1 (Launch - 3 months)

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Users Registered** | 50+ | Supabase Auth |
| **Data Entries** | 200+ people | Database count |
| **Admin Trained** | 3+ | Training completion |
| **Uptime** | >99% | Vercel analytics |

### 6.2 Phase 2 (Growth - 6 months)

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Active Users** | 100+ MAU | Analytics |
| **Data Accuracy** | >95% | HĐGT review |
| **Community Forks** | 3+ | GitHub |
| **Contributions** | 50+ | Contribution count |

### 6.3 Phase 3 (Maturity - 12 months)

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Coverage** | >80% dòng họ | Data completeness |
| **Other Families** | 5+ | Deployments |
| **GitHub Stars** | 100+ | GitHub |

---

## 7. Alternatives Analysis

### 7.1 Do Nothing

- **Result:** Tiếp tục dùng Excel/giấy
- **Risk:** Mất mát thông tin qua thế hệ
- **Verdict:** ❌ Không chấp nhận

### 7.2 Use Existing SaaS

- **Result:** Dùng Ancestry/MyHeritage
- **Cost:** $200-500/year
- **Risk:** Không phù hợp văn hóa VN, English-only
- **Verdict:** ❌ Không phù hợp

### 7.3 Build Custom (Selected) ✅

- **Result:** Giải pháp fit 100%
- **Cost:** $0/month
- **Risk:** Development effort
- **Verdict:** ✅ Best option

---

## 8. Approval & Next Steps

### 8.1 Decision Required

- [ ] **Approve Business Case** - Proceed to Planning phase
- [ ] **Reject** - Document reasons
- [ ] **Defer** - Revisit at later date

### 8.2 Next Steps (Upon Approval)

1. ✅ Complete Stage 00-Foundation
2. ⏳ Create BRD (Business Requirements Document)
3. ⏳ Create Technical Design Document
4. ⏳ Create Project Roadmap
5. ⏳ Begin Sprint 1 - Core Features

### 8.3 Approval

| Role | Name | Date | Decision |
|------|------|------|----------|
| Sponsor | Chủ tịch HĐGT | | ⏳ Pending |
| PM | @pm | 2026-02-24 | ✅ Recommend GO |

---

**Previous:** [Problem Statement](./problem-statement.md)
**Next:** [01-Planning/BRD](../01-planning/BRD.md)

*SDLC Framework 6.1.1 - Stage 00 Foundation*
