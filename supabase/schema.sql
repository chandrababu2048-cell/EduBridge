-- EduBridge — Supabase schema
-- Paste this into the Supabase SQL editor and click Run.

-- Stores each user's XP, learning stats, and earned badges.
-- One row per user, upserted on every progress update.
create table public.user_progress (
  user_id         uuid references auth.users(id) on delete cascade primary key,
  xp              integer      not null default 0,
  total_questions integer      not null default 0,
  streak          integer      not null default 0,
  last_subject    text,
  used_telugu     boolean      not null default false,
  learned_early   boolean      not null default false,
  by_subject      jsonb        not null default '{"Math":0,"Science":0,"English":0}'::jsonb,
  updated_at      timestamptz  not null default now()
);

-- Row-level security: every user can only read and write their own row.
alter table public.user_progress enable row level security;

create policy "select own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);
