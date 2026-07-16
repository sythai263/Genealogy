# 🌳 Gia Phả Điện Tử - Frontend

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- pnpm
- Supabase account

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
pnpm build
```

## 🗄️ Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Install
   [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
   - Login to supabase account

   ```bash
   supabase login
   ```

   - Linked to project

   ```bash
   supabase link --project-ref <project_id>
   ```

   - Run migration

   ```bash
   supabase db push
   ```

3. Run the SQL in `supabase/seed.sql`
4. Copy your project URL and anon key to `.env.local`

## Migration

- To create new migration use command

```bash
supabase migration new <migration_name>
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (main)/          # Main app with sidebar
│   │   ├── tree/        # Family tree view
│   │   ├── people/      # People management
│   │   ├── directory/   # Contact directory
│   │   ├── events/      # Memorial calendar
│   │   └── admin/       # Admin panel
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── auth/            # Auth components
│   └── ...
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── supabase-data.ts # Data operations
│   └── utils.ts         # Utilities
├── hooks/               # React hooks
├── stores/              # Zustand stores
└── types/               # TypeScript types
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **State:** Zustand + React Query
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth

## 📋 Features

### Sprint 1 (Current) ✅

- [x] Project scaffolding
- [x] Database schema
- [x] Auth (login/register)
- [x] Layout with sidebar
- [x] Homepage

### Sprint 2 (Coming)

- [ ] People CRUD
- [ ] Family relationships
- [ ] Basic tree view
- [ ] Search & filter

### Sprint 3+

- [ ] Interactive tree
- [ ] Admin panel
- [ ] Memorial calendar
- [ ] GEDCOM export

## 📝 License

MIT - Open source for Vietnamese families

---

_Gìn giữ tinh hoa - Tiếp bước cha ông_
