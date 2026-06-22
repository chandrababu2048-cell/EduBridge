-- EduBridge — Teacher & Student Schema
-- Migration 001: core teacher/student tables with RLS policies.
-- Run this in the Supabase SQL editor once the project is connected.
-- Until then, the app uses backend/lib/store.js (JSON files) as a drop-in.

-- schools table
create table if not exists public.schools (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  district text,
  state text default 'Telangana',
  created_at timestamptz default now()
);

-- teacher_profiles
create table if not exists public.teacher_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  school_name text,
  grades text[],
  subjects text[],
  created_at timestamptz default now()
);

-- classes
create table if not exists public.classes (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  grade text not null,
  class_code text unique not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- class_members
create table if not exists public.class_members (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  student_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(class_id, student_id)
);

-- student_profiles
create table if not exists public.student_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  grade text,
  school_name text,
  created_at timestamptz default now()
);

-- RLS
alter table public.schools enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.student_profiles enable row level security;

create policy "teacher owns profile" on public.teacher_profiles for all using (auth.uid() = user_id);
create policy "student owns profile" on public.student_profiles for all using (auth.uid() = user_id);
create policy "teacher owns classes" on public.classes for all using (auth.uid() = teacher_id);
create policy "members can read class" on public.classes for select using (
  exists (select 1 from public.class_members where class_id = id and student_id = auth.uid())
);
create policy "student joins class" on public.class_members for insert with check (auth.uid() = student_id);
create policy "student sees own memberships" on public.class_members for select using (auth.uid() = student_id);
create policy "teacher sees class members" on public.class_members for select using (
  exists (select 1 from public.classes where id = class_id and teacher_id = auth.uid())
);
