begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.-]{3,32}$'),
  name text not null check (char_length(name) between 1 and 100),
  role text not null default 'student' check (role in ('admin','teacher','student')),
  grade smallint,
  blocked boolean not null default false,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  check ((role='student' and grade is not null and grade between 5 and 11) or (role in ('admin','teacher') and grade is null))
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
-- No client INSERT/UPDATE policies: users cannot grant themselves privileges.
-- Only read one's own record, including blocked/password-change status for the login gate.
create policy profiles_read_self on public.profiles for select to authenticated using (id=auth.uid());

-- Reuse these functions in ALL future content/grades/class policies. UI checks are not authorization.
create function public.has_active_account() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and not p.blocked and not p.must_change_password);
$$;
create function public.is_platform_admin() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin' and not p.blocked and not p.must_change_password);
$$;
revoke all on function public.has_active_account() from public, anon;
revoke all on function public.is_platform_admin() from public, anon;
grant execute on function public.has_active_account() to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
commit;
