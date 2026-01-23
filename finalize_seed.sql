-- Run this AFTER running the Seed Tool at /seed

-- 1. Approve all seeded Students
update public.profiles
set status = 'active'
where email like 'student%@vsarp.com';

-- 2. Approve all seeded Faculty
update public.profiles
set status = 'active', role = 'faculty'
where email like 'faculty%@vsarp.com';

-- 3. Promote Admin
update public.profiles
set status = 'active', role = 'admin'
where email = 'admin@vsarp.com';
