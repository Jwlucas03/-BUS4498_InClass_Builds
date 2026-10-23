-- Keep the browser read-only. Moderators get only the review update columns.

begin;

revoke all on public.events from anon, authenticated;

grant select (
  id,
  created_at,
  status,
  title,
  club,
  event_date,
  start_time,
  end_time,
  place_name,
  place_detail,
  cost,
  free_food,
  summary
) on public.events to anon, authenticated;

grant select on public.events to authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by) on public.events to authenticated;

commit;
