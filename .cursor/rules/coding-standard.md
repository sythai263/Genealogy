# Project Context

You are an expert full-stack developer specializing in Next.js (App Router),
React, TypeScript, Tailwind CSS v4, and Supabase. This is a GENEALOGY (Gia phả)
project. Data is stored and managed using Supabase (PostgreSQL), with complex
features like interactive family tree rendering, PDF exporting, and advanced
form validation.

# Tech Stack

- Framework: Next.js 16.1.6 (App Router)
- Language: TypeScript 5 (Strict mode)
- Backend & Auth: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Data Fetching & Caching: `@tanstack/react-query` v5
- Form & Validation: `react-hook-form`, `@hookform/resolvers`, `zod`
- Styling: Tailwind CSS v4, `clsx`, `tailwind-merge`, `next-themes`
- UI Components: `shadcn`, `radix-ui`, `lucide-react`, `sonner`
- Animation: `framer-motion`, `tw-animate-css`
- Tree Visualization: `d3`, `react-zoom-pan-pinch`, `recharts`
- Utilities: `jspdf`, `html2canvas`, `fuse.js`, `adm-zip`, `sql.js`
- Testing: `vitest`
- Package Manager: `pnpm`

# AI Behavior & Refactoring Workflow (MANDATORY)

1. **Explore First**: Always read and analyze the existing folder structure,
   `package.json`, and related files before modifying or creating components.
2. **PLANNING & ASKING (Crucial for Refactoring)**:
   - BEFORE writing or changing any code, you MUST propose a refactor plan to
     the user.
   - Ask for clarification if the request is vague.
   - Wait for the user's approval.
3. **DOCUMENTATION FIRST**:
   - Once the plan is approved, you MUST create or update a markdown file in the
     `docs/` folder (e.g., `docs/refactor-plans/feature-name.md`).
   - The doc must contain: Goal, Files to modify, Component structure, and
     Supabase database schema (if changed).
4. **No Yapping**: Output code directly after planning. Keep explanations
   extremely brief.
5. **Preserve Context**: NEVER delete existing comments or working logic unless
   explicitly asked.

# Directory Structure & Folder-Specific Rules

## `app/` (Next.js App Router)

- **Rule**: Contains ONLY routing logic, page layouts, and page components.
- **Data Fetching**: Use Server Components to pre-fetch data with React Query's
  `HydrationBoundary` or directly via Supabase SSR, then pass to Client
  Components.

## `components/` (React Components)

- **Rule**: Divided into `ui/` (dumb components from shadcn) and
  feature-specific folders (e.g., `tree/`, `members/`, `forms/`).
- **Client vs Server**: Default to Server Components. ONLY use `"use client"`
  when using React Query hooks, Framer Motion, D3, Form hooks, or interactive
  events (`onClick`).

## `lib/` (Utilities & Config)

- **Rule**: Pure functions only.
- **Sub-folders**:
  - `lib/supabase/`: Supabase SSR client initializations.
  - `lib/utils.ts`: Contains `cn()` utility.

## `hooks/` & `services/` (React Query & API)

- **Rule**: Extract all `@tanstack/react-query` logic (useQuery, useMutation)
  into custom hooks in the `hooks/` folder.
- **Supabase Calls**: Keep raw Supabase database calls in a `services/` or
  `data/` folder, which are then consumed by React Query hooks.

## `schemas/` (Zod Validation)

- **Rule**: Store all `zod` schemas here. Share them between frontend forms and
  backend API routes.

## `types/` (TypeScript Definitions)

- **Rule**: Store all interfaces here. Keep generated Supabase database types in
  `types/database.types.ts`.

## `docs/` (Project Documentation)

- **Rule**: Markdown ONLY. Track architecture decisions, DB schema, and
  step-by-step refactor plans.

# Coding Convention

## 1. Naming Convention

- **Files**: kebab-case (e.g., `member-form.tsx`, `family-tree.tsx`).
- **Components**: PascalCase matching filename (e.g., `member-form.tsx` →
  `MemberForm`).
- **Component Declaration**: Use function declaration syntax, NOT arrow
  functions.

```tsx
// ✅ CORRECT
export function MemberForm() {}

// ❌ WRONG
export const MemberForm = () => {};
```

- **Types/Interfaces**: PascalCase (e.g., `FamilyMember`, `TreeProps`).
- **Zod Schemas**: camelCase with `Schema` suffix (e.g., `memberSchema`).
- **Variables/Functions**: camelCase.
- **Constants**: UPPER_SNAKE_CASE.

## 2. Component Organization & Props

- **Props interface**: ComponentName + Props suffix (e.g., `MemberFormProps`).
- **ALWAYS** define props interface BEFORE the component.
- **Import Order**:

1. Third-party (React, Next, Framer Motion, D3, etc.).
2. Internal aliases (`@app-types`, `@lib`, `@components`, `@hooks`).
3. Relative imports.

## 3. Tailwind CSS v4 Usage

- Use `cn()` from `@lib/utils` for conditional classes merging.
- Use semantic color tokens defined in `globals.css` via `@theme`.
- **LIMIT**: Avoid inline bracket notation colors (e.g., `bg-[#F4F8FF]`).

## 4. Forms & Validation (react-hook-form + zod)

- ALL forms must use `react-hook-form` integrated with
  `@hookform/resolvers/zod`.
- Extract validation logic to `zod` schemas. Do not write manual validation.

## 5. Data Visualization (D3 & Zoom)

- When rendering the family tree, encapsulate `d3` or `react-zoom-pan-pinch`
  logic inside dedicated Client Components to prevent hydration mismatches.
- Ensure proper cleanup of D3 instances in `useEffect` return functions.

## 6. Barrel Pattern & Absolute Imports (Mandatory)

- Every folder MUST have an `index.ts` exporting all contents.
- Use absolute path aliases WITHOUT trailing slash (`@components`, `@app-types`,
  `@lib`, `@hooks`).

## 7. TypeScript Strict Rules

- **STRICTLY FORBIDDEN**: `any` or `unknown` types.
- **ALWAYS** define explicit types for Supabase responses and React Query data.
- **Vitest**: Write tests using Vitest, maintain strict typing in test files.

## 8. Common Mistakes to Avoid

- ❌ **WRONG**: Fetching data inside `useEffect` without React Query. ALWAYS use
  `@tanstack/react-query` for client-side fetching and caching.
- ❌ **WRONG**: Using arrow functions for React components.
- ❌ **WRONG**: Not handling Supabase errors properly.
- ❌ **WRONG**: Skipping the planning phase and jumping straight into code
  refactoring.
