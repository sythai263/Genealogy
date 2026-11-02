-- ============================================================================
-- names + name_meanings — public baby-name dictionary
--   · names: one row per given name (1–2 words), gender + status gate
--   · name_meanings: many meanings per name, each moderated separately
--   · approved names are readable by everyone (anon + authenticated)
--   · anyone may insert, always as 'pending' — admin/editor approve later
--   · name_search keeps a folded (unaccent, lowercase) copy for DB-side search
-- ============================================================================

create extension if not exists unaccent with schema extensions;

create table public.names (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text not null check (gender in ('male', 'female', 'both')),
  -- words in the given name: 1 → 3-word full name, 2 → 4-word full name
  name_word_count smallint not null check (name_word_count in (1, 2)),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  contributor_name text,
  contributor_note text,
  name_search text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.name_meanings (
  id uuid primary key default gen_random_uuid(),
  name_id uuid not null references public.names (id) on delete cascade,
  meaning text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  contributor_name text,
  contributor_note text,
  created_at timestamptz not null default now()
);

create index names_status_idx on public.names (status);
create index names_search_idx on public.names (name_search);
create index name_meanings_name_idx on public.name_meanings (name_id);
create index name_meanings_status_idx on public.name_meanings (status);

create or replace function public.names_set_search()
returns trigger
language plpgsql
as $$
begin
  new.name_search := extensions.unaccent(lower(new.name));
  new.updated_at := now();
  return new;
end;
$$;

create trigger names_search_trg
  before insert or update of name on public.names
  for each row execute function public.names_set_search();

alter table public.names enable row level security;
alter table public.name_meanings enable row level security;

-- Approved names are public.
create policy "Anyone can read approved names"
  on public.names for select
  to anon, authenticated
  using (status = 'approved');

-- Admins/editors see every name row including pending submissions.
create policy "Admin can read all names"
  on public.names for select
  to authenticated
  using (public.is_admin_or_editor());

-- Community contributions — only ever pending at insert time.
create policy "Anyone can submit a name"
  on public.names for insert
  to anon, authenticated
  with check (status = 'pending');

-- Admins may insert pre-approved rows (moderated seeds/manual additions).
create policy "Admin can insert names"
  on public.names for insert
  to authenticated
  with check (public.is_admin_or_editor());

create policy "Admin can update names"
  on public.names for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

create policy "Admin can delete names"
  on public.names for delete
  to authenticated
  using (public.is_admin_or_editor());

-- Meanings: public sees only approved meanings of approved names.
create policy "Anyone can read approved meanings"
  on public.name_meanings for select
  to anon, authenticated
  using (
    status = 'approved'
    and exists (
      select 1 from public.names n
      where n.id = name_id and n.status = 'approved'
    )
  );

create policy "Admin can read all meanings"
  on public.name_meanings for select
  to authenticated
  using (public.is_admin_or_editor());

create policy "Anyone can submit a meaning"
  on public.name_meanings for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "Admin can insert meanings"
  on public.name_meanings for insert
  to authenticated
  with check (public.is_admin_or_editor());

create policy "Admin can update meanings"
  on public.name_meanings for update
  to authenticated
  using (public.is_admin_or_editor())
  with check (public.is_admin_or_editor());

create policy "Admin can delete meanings"
  on public.name_meanings for delete
  to authenticated
  using (public.is_admin_or_editor());
