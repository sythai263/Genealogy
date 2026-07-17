---
project: Genealogy (Gia phả Dòng họ)
path: CLAUDE.md
type: agent-guidelines
version: 3.0.0 (Pure Web)
---

# AI Coding Agent Guidelines - Tech Lead Strict Rules

## 1. Project Overview & Tech Stack

Dự án "Gia phả Dòng họ" là hệ thống quản lý gia phả thuần Web (Pure Web
Application). Tuyệt đối không sử dụng các tư duy, thư viện hoặc kiến trúc liên
quan đến Desktop/Electron.

- **Framework:** Next.js 16 (App Router)
- **Data Fetching:** `@tanstack/react-query` v5 + `@supabase/ssr`
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS v4, shadcn/ui
- **UI & Animation:** framer-motion, d3, react-zoom-pan-pinch
- **Form & Validation:** react-hook-form, zod

## 2. STRICT CODING RULES (BẮT BUỘC TUÂN THỦ)

Nếu AI vi phạm các quy tắc này, code sẽ bị reject ngay lập tức.

### 2.1. React & Next.js Components

- **KHÔNG dùng Arrow Functions cho Components.** Luôn sử dụng `export function`.

  ```tsx
  // X BAD
  const UserProfile = () => {
    return <div />;
  };

  // ✓ GOOD
  export function UserProfile() {
    return <div />;
  }
  ```

- **Server Components by Default:** Mặc định mọi component phải là Server
  Component. Chỉ thêm `"use client"` ở dòng đầu tiên khi thực sự cần thiết (sử
  dụng hooks như `useState`, sự kiện `onClick`, hoặc bọc React Query provider).
- **Props Definition:** Luôn định nghĩa `interface Props` ngay trên khai báo
  component. Không inline type.

```tsx
// X BAD
export function Avatar({ url }: { url: string }) {}

// ✓ GOOD
interface AvatarProps {
  url: string;
  alt?: string;
}
export function Avatar({ url, alt = '' }: AvatarProps) {}
```

- **Absolute Imports:** Luôn sử dụng Absolute Imports (ví dụ:
  `@components/ui/...`, `@lib/utils`). Tuyệt đối không dùng relative paths kiểu
  `../../components/`.

### 2.2. TypeScript Strictness

- **KHÔNG dùng `any`.** Nghiêm cấm mọi hình thức type casting lỏng lẻo. Luôn
  định nghĩa Interface/Type chặt chẽ cho Data Layer và API Response.
- Prefer `interface` over `type` for object shapes.

### 2.3. Styling (Tailwind CSS v4)

- **Sử dụng `cn()`:** Luôn dùng utility `cn()` (từ `clsx` và `tailwind-merge`)
  để gộp classes, đặc biệt khi có điều kiện logic.
- **KHÔNG mã màu inline (Arbitrary values):** Tuyệt đối không dùng `bg-[#FFF]`
  hay `text-[#1a1a1a]`. Phải sử dụng hệ thống màu chuẩn của Tailwind v4 hoặc cấu
  hình CSS variables trong global theme.

### 2.4. Data Fetching & Architecture

- **Server-side:** Fetch trực tiếp từ Supabase bằng `@supabase/ssr` bên trong
  Server Components.
- **Client-side (Mutations/Interactions):** Dùng React Query v5 (`useQuery`,
  `useMutation`) kết hợp với Supabase client (`createBrowserClient`).
- **Data Layer:** Tách biệt logic gọi DB ra khỏi UI. Đặt tại thư mục
  `@lib/supabase-data-...`.

## 3. Project Structure

```text
/src
├── app/                  # Next.js App Router (Server Components)
│   ├── (auth)/           # Authentication routes
│   ├── (main)/           # Authenticated application routes
│   └── api/              # Route handlers
├── components/           # UI Components
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # Header, Sidebar, Navigation
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React Query hooks (use-*.ts)
├── lib/                  # Utilities, Supabase clients, Data Layer
└── types/                # Global TypeScript interfaces

```

## 4. Development Workflow

- `pnpm dev` - Start development server.
- `pnpm build` - Build for production.
- `pnpm lint` - ESLint check (Ensure no `any` or unused vars).
