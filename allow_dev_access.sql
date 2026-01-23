-- RLS & CONSTRAINT FIX FOR DEV MODE (AUTH BYPASS) - FINAL
-- Run this in your Supabase SQL Editor.

-- 1. Remove Foreign Key Constraint on 'student_id'
-- This allows our "Dev Student" (who doesn't exist in Supabase Auth) to save activities.
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_student_id_fkey;

-- 2. Activities Table Access (Ensure Policies exist)
DROP POLICY IF EXISTS "Allow public access to activities" ON activities;
create policy "Allow public access to activities"
on activities
for all
using (true)
with check (true);

-- 3. Categories Table Access
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
create policy "Allow public read access to categories"
on categories
for select
using (true);

-- 4. Audit Logs Access
DROP POLICY IF EXISTS "Allow public read access to logs" ON audit_logs;
create policy "Allow public read access to logs"
on audit_logs
for select
using (true);

DROP POLICY IF EXISTS "Allow public insert to logs" ON audit_logs;
create policy "Allow public insert to logs"
on audit_logs
for insert
with check (true);
