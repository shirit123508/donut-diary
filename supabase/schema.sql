-- יומן סופגניות: סכימה בסיסית עם RLS (Supabase Postgres)

-- extensions
create extension if not exists "pgcrypto";

-- =========================
-- Groups (משפחה)
-- =========================
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

-- =========================
-- Group members
-- =========================
create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- =========================
-- Donut entries
-- =========================
create table if not exists public.donut_entries (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  visibility text not null default 'private' check (visibility in ('private','group')),
  date timestamptz not null default now(),
  place_name text not null,
  donut_name text not null,
  filling text,
  rating int not null check (rating between 1 and 10),
  price numeric,
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_donut_entries_created_by on public.donut_entries(created_by);
create index if not exists idx_donut_entries_group_id on public.donut_entries(group_id);
create index if not exists idx_group_members_user_id on public.group_members(user_id);

-- =========================
-- RLS
-- =========================
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.donut_entries enable row level security;

-- helper: check membership
create or replace function public.is_member_of_group(gid uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.group_members gm
    where gm.group_id = gid and gm.user_id = auth.uid()
  );
$$;

-- GROUPS policies:
-- anyone signed in can create a group
create policy "groups_insert_own"
on public.groups
for insert
to authenticated
with check (created_by = auth.uid());

-- group is visible to its members (and creator)
create policy "groups_select_members"
on public.groups
for select
to authenticated
using (public.is_member_of_group(id) or created_by = auth.uid());

-- allow creator to update/delete (simple admin model)
create policy "groups_update_creator"
on public.groups
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "groups_delete_creator"
on public.groups
for delete
to authenticated
using (created_by = auth.uid());

-- GROUP_MEMBERS policies:
-- members can see membership rows of their group
create policy "gm_select_members"
on public.group_members
for select
to authenticated
using (public.is_member_of_group(group_id));

-- allow a signed-in user to add themselves to a group (join flow)
create policy "gm_insert_self"
on public.group_members
for insert
to authenticated
with check (user_id = auth.uid());

-- allow user to leave group (delete own row)
create policy "gm_delete_self"
on public.group_members
for delete
to authenticated
using (user_id = auth.uid());

-- DONUT_ENTRIES policies:
-- select: own private entries OR group entries where user is a member
create policy "entries_select_own_or_group"
on public.donut_entries
for select
to authenticated
using (
  created_by = auth.uid()
  or (visibility = 'group' and group_id is not null and public.is_member_of_group(group_id))
);

-- insert: creator must be current user; if group visibility then must be a member
create policy "entries_insert_rules"
on public.donut_entries
for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    visibility = 'private'
    or (visibility = 'group' and group_id is not null and public.is_member_of_group(group_id))
  )
);

-- update/delete: only creator
create policy "entries_update_creator"
on public.donut_entries
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "entries_delete_creator"
on public.donut_entries
for delete
to authenticated
using (created_by = auth.uid());
