begin;

delete from auth.refresh_tokens;
delete from auth.sessions;
delete from auth.identities;
delete from auth.users;

drop trigger if exists placement_drive_notifications on public.placement_drives;
drop trigger if exists profiles_guard_updates on public.profiles;
drop trigger if exists profiles_set_updated_at on public.profiles;
drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.seed_demo_account(uuid, text, text, text, text, text, text, text, text, text[]) cascade;
drop function if exists public.notify_students_about_drive() cascade;
drop function if exists public.guard_profile_updates() cascade;
drop function if exists public.is_role(text[]) cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

drop table if exists public.aptitude_attempts cascade;
drop table if exists public.aptitude_tests cascade;
drop table if exists public.placement_notifications cascade;
drop table if exists public.placement_applications cascade;
drop table if exists public.placement_drives cascade;
drop table if exists public.semester_results cascade;
drop table if exists public.courses cascade;
drop table if exists public.research_papers cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.activities cascade;
drop table if exists public.student_skills cascade;
drop table if exists public.student_goals cascade;
drop table if exists public.skill_resources cascade;
drop table if exists public.learning_resources cascade;
drop table if exists public.career_skills cascade;
drop table if exists public.skills cascade;
drop table if exists public.careers cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

commit;
