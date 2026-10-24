-- Stage 8: moderator sign-in and protected review actions.
-- Run this after the events table migration exists.

begin;

alter table public.events enable row level security;

drop policy if exists "published events and moderator review access" on public.events;
drop policy if exists "authenticated may review events" on public.events;
drop policy if exists "authenticated may select every event" on public.events;
drop policy if exists "public may select published events" on public.events;

create policy "public may select published events"
  on public.events
  for select
  to anon
  using (status = 'published');

create policy "authenticated may select every event"
  on public.events
  for select
  to authenticated
  using ((select auth.uid()) = 'd13d05d3-6be4-4f83-a118-0871713ecd19'::uuid);

create policy "authenticated may review events"
  on public.events
  for update
  to authenticated
  using ((select auth.uid()) = 'd13d05d3-6be4-4f83-a118-0871713ecd19'::uuid)
  with check (
    (select auth.uid()) = 'd13d05d3-6be4-4f83-a118-0871713ecd19'::uuid
    and status in ('published', 'waiting', 'rejected')
    and reviewed_by = (select auth.uid())::text
  );

grant select on public.events to authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by) on public.events to authenticated;

commit;
