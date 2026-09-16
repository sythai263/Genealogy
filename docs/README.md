---
project: AncestorTree
path: docs/README.md
type: index
version: 1.1.0
updated: 2026-09-16
owner: "@pm"
status: approved
---

# AncestorTree Documentation

> Gia Phả Điện Tử - Họ Đặng làng Kỷ Các

## SDLC Framework v6.1.0 - LITE Tier

This project uses the **LITE** tier of the MTS SDLC Framework with 5 stages:

```
docs/
├── 00-foundation/     # Vision, scope, requirements
├── 01-planning/       # Roadmap, sprints, milestones
├── 02-design/         # Architecture, UI/UX, data models
├── 04-build/          # Implementation guidelines, code standards
├── 05-test/           # Test plans, test cases, QA
├── backend/           # API reference, security review
├── security/          # Audit plan (security + performance)
└── refactor-plans/    # Completed refactor plans
```

## Quick Links

- [Vision & Scope](./00-foundation/VISION.md)
- [Sprint Plan](./04-build/SPRINT-PLAN.md)
- [Technical Design](./02-design/technical-design.md)
- [API Endpoints](./backend/API-ENDPOINTS.md)
- [User Guide](./04-build/USER-GUIDE.md)
- [Codebase Audit 2026-09](./CODEBASE-AUDIT.md) — docs ↔ code mismatch report + implementation plan

## Project Structure

```
AncestorTree/           # repo root = the web app (pure web, no desktop)
├── src/               # Next.js 16 + React 19 + Tailwind (App Router)
├── supabase/          # Database migrations, seed, config.toml
├── scripts/           # local-setup.mjs, codemods
├── docs/              # Documentation (SDLC LITE)
├── public/            # Static assets + robots.txt
├── Dockerfile         # Multi-stage standalone build
└── package.json
```

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, next-intl (vi + en)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel (frontend), Supabase Cloud (backend)

> **Note (2026-09):** Desktop/Electron code đã được gỡ khỏi codebase —
> dự án là pure web app (xem CLAUDE.md v3.0.0). Các docs mô tả desktop
> (INSTALLATION-GUIDE, TEST-PLAN §5, SPRINT-PLAN Sprint 9, technical-design
> §10.3) được giữ lại như tài liệu lịch sử.
