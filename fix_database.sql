-- FIX SCRIPT for VSARP Backend
-- Run this in Supabase SQL Editor to repair the setup

-- 1. CLEANUP: Drop existing triggers and functions to ensure clean slate
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. TABLE REPAIR: Ensure profiles table has all required columns
create table if not exists public.profiles (
  id uuid references auth.users not null primary key
);

-- Add columns if they don't exist (safe idempotent operations)
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email') then
        alter table public.profiles add column email text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'full_name') then
        alter table public.profiles add column full_name text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
        alter table public.profiles add column role text;
        alter table public.profiles add constraint profiles_role_check check (role in ('student', 'faculty', 'admin'));
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'student_id') then
        alter table public.profiles add column student_id text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'department') then
        alter table public.profiles add column department text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'status') then
        alter table public.profiles add column status text default 'pending';
        alter table public.profiles add constraint profiles_status_check check (status in ('pending', 'active', 'rejected'));
    end if;
end $$;

-- 3. FUNCTION RE-CREATION: Stronger Security Definer Function
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, student_id, department, status)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'student_id', 
    new.raw_user_meta_data->>'department',
    'pending'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role; -- Update existing if needed
  return new;
end;
$$ language plpgsql security definer;

-- 4. TRIGGER RE-CREATION
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. PERMISSIONS (Crucial Fix)
-- Ensure the function can write to the profile table
grant usage on schema public to service_role;
grant all on public.profiles to service_role;
grant all on public.profiles to postgres;
grant all on public.profiles to anon;
grant all on public.profiles to authenticated;
