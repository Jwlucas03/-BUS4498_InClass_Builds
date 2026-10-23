-- Keep the published-read and moderator-read paths in one policy.

begin;

drop policy if exists "authenticated may select every event" on public.events;
drop policy if exists "public may select published events" on public.events;
drop policy if exists "published events and moderator review access" on public.events;

create policy "published events and moderator review access"
  on public.events
  for select
  to anon, authenticated
  using (
    status = 'published'
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator'
  );

drop policy if exists "authenticated may review events" on public.events;
create policy "authenticated may review events"
  on public.events
  for update
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator')
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator'
    and status in ('published', 'waiting', 'rejected')
    and reviewed_by = (select auth.uid())::text
  );

commit;
