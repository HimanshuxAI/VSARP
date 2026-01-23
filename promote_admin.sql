-- Run this in Supabase SQL Editor AFTER registering as 'admin@test.com'

update public.profiles
set 
  role = 'admin',
  status = 'active'
where email = 'admin@test.com';
