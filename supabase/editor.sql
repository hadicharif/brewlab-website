-- ═════════════════════════════════════════════════════════════
--  Brew Lab — website editor (owners only)
--  Run once in Supabase → SQL Editor, after schema.sql,
--  feedback.sql and loyalty-card.sql.
--
--  Adds:
--    profiles.is_owner   owners can use the editor (and are staff too)
--    site_content        menu changes, add-on prices, shop info,
--                        promos, announcements, best sellers
--                        (everyone can read it, only owners save it)
--    change_log          who changed what, and when
--    menu-photos         storage folder for menu photos
--  Points rules and rewards can now be changed by owners only.
-- ═════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists is_owner boolean not null default false;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_owner from public.profiles where id = auth.uid()), false)
$$;

-- ─── Website content ─────────────────────────────────────────
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.site_content enable row level security;
drop policy if exists "anyone reads site content" on public.site_content;
create policy "anyone reads site content" on public.site_content for select using (true);
revoke insert, update, delete on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;

-- ─── Change history ──────────────────────────────────────────
create table if not exists public.change_log (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  who     text,
  area    text not null,
  summary text not null
);
create index if not exists change_log_at_idx on public.change_log (at desc);
alter table public.change_log enable row level security;
drop policy if exists "owners read history" on public.change_log;
create policy "owners read history" on public.change_log for select using (public.is_owner());
revoke insert, update, delete on public.change_log from anon, authenticated;
grant select on public.change_log to authenticated;

create or replace function public.log_change(p_area text, p_summary text) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.change_log (user_id, who, area, summary)
  values (
    auth.uid(),
    coalesce((select name from public.profiles where id = auth.uid()), (select email from auth.users where id = auth.uid())),
    p_area, left(coalesce(nullif(trim(p_summary), ''), 'Changed ' || p_area), 1000)
  );
end $$;
revoke execute on function public.log_change(text, text) from public, anon, authenticated;

-- OWNER: save one part of the website
create or replace function public.owner_save(p_key text, p_value jsonb, p_summary text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'Owners only'; end if;
  if p_key not in ('menu', 'addons', 'shop', 'promos', 'announcements', 'bestsellers') then
    raise exception 'Unknown part: %', p_key;
  end if;
  if p_value is null or jsonb_typeof(p_value) not in ('object', 'array') then raise exception 'Nothing to save'; end if;
  if length(p_value::text) > 200000 then raise exception 'Too much to save at once'; end if;
  insert into public.site_content (key, value, updated_at, updated_by)
  values (p_key, p_value, now(), auth.uid())
  on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = auth.uid();
  perform public.log_change(p_key, p_summary);
end $$;

-- ─── Points rules and rewards: owners only ───────────────────
drop policy if exists "staff edit settings" on public.settings;
drop policy if exists "staff edit tiers" on public.reward_tiers;
revoke insert, update, delete on public.settings, public.reward_tiers from anon, authenticated;

create or replace function public.owner_save_rewards(p_ppd int, p_welcome int, p_window int, p_tiers jsonb, p_summary text) returns void
language plpgsql security definer set search_path = public as $$
declare t jsonb; n int := 0; kept text[] := '{}';
begin
  if not public.is_owner() then raise exception 'Owners only'; end if;
  if p_ppd is null or p_ppd < 1 or p_ppd > 1000 then raise exception 'Points per $1 must be between 1 and 1000'; end if;
  if p_welcome is null or p_welcome < 0 or p_welcome > 100000 then raise exception 'Welcome points must be 0 or more'; end if;
  if p_window is null or p_window < 0 or p_window > 31 then raise exception 'Birthday days must be between 0 and 31'; end if;
  if jsonb_typeof(p_tiers) <> 'array' then raise exception 'Rewards list missing'; end if;

  update public.settings set points_per_dollar = p_ppd, welcome_points = p_welcome, birthday_window_days = p_window where id = 1;

  for t in select * from jsonb_array_elements(p_tiers) loop
    n := n + 1;
    if coalesce(trim(t ->> 'id'), '') = '' or coalesce(trim(t ->> 'name_en'), '') = '' then raise exception 'Each reward needs a name'; end if;
    if (t ->> 'points')::int is null or (t ->> 'points')::int < 1 then raise exception 'Each reward needs points (1 or more)'; end if;
    insert into public.reward_tiers (id, points, name_en, name_ar, active, sort)
    values (t ->> 'id', (t ->> 'points')::int, trim(t ->> 'name_en'), coalesce(nullif(trim(t ->> 'name_ar'), ''), trim(t ->> 'name_en')), true, n)
    on conflict (id) do update set points = excluded.points, name_en = excluded.name_en, name_ar = excluded.name_ar, active = true, sort = n;
    kept := kept || (t ->> 'id');
  end loop;
  -- rewards taken off the list are hidden (codes already given keep working)
  update public.reward_tiers set active = false where not (id = any (kept));
  perform public.log_change('rewards', p_summary);
end $$;

-- ─── Staff and owners ────────────────────────────────────────
create or replace function public.owner_list_team()
returns table (email text, name text, is_staff boolean, is_owner boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'Owners only'; end if;
  return query
    select u.email::text, p.name, p.is_staff, p.is_owner
    from public.profiles p join auth.users u on u.id = p.id
    where p.is_staff or p.is_owner
    order by p.is_owner desc, p.name nulls last;
end $$;

-- p_role: 'owner', 'staff' or 'none'
create or replace function public.owner_set_role(p_email text, p_role text) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid; nm text;
begin
  if not public.is_owner() then raise exception 'Owners only'; end if;
  if p_role not in ('owner', 'staff', 'none') then raise exception 'Unknown role'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if uid is null then raise exception 'No account with this email yet. Ask them to sign up on the website (Rewards) first.'; end if;
  if uid = auth.uid() and p_role <> 'owner' then raise exception 'You can''t remove yourself. Ask another owner to do it.'; end if;
  update public.profiles set is_owner = (p_role = 'owner'), is_staff = (p_role <> 'none')
  where id = uid returning coalesce(name, p_email) into nm;
  perform public.log_change('staff', case p_role
    when 'owner' then nm || ' is now an owner'
    when 'staff' then nm || ' is now staff'
    else nm || ' was removed from staff' end);
  return nm;
end $$;

-- ─── Menu photos ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-photos', 'menu-photos', true, 3145728, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "owners add menu photos" on storage.objects;
drop policy if exists "owners change menu photos" on storage.objects;
drop policy if exists "owners delete menu photos" on storage.objects;
create policy "owners add menu photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-photos' and public.is_owner());
create policy "owners change menu photos" on storage.objects for update to authenticated
  using (bucket_id = 'menu-photos' and public.is_owner());
create policy "owners delete menu photos" on storage.objects for delete to authenticated
  using (bucket_id = 'menu-photos' and public.is_owner());

-- ─── Who may call what ───────────────────────────────────────
revoke execute on function public.owner_save(text, jsonb, text) from public;
revoke execute on function public.owner_save_rewards(int, int, int, jsonb, text) from public;
revoke execute on function public.owner_list_team() from public;
revoke execute on function public.owner_set_role(text, text) from public;
grant execute on function public.is_owner() to anon, authenticated;
grant execute on function public.owner_save(text, jsonb, text) to authenticated;
grant execute on function public.owner_save_rewards(int, int, int, jsonb, text) to authenticated;
grant execute on function public.owner_list_team() to authenticated;
grant execute on function public.owner_set_role(text, text) to authenticated;

-- ─── Make Hadi the first owner ───────────────────────────────
update public.profiles set is_owner = true, is_staff = true
where id = (select id from auth.users where lower(email) = 'hadicharif1234@gmail.com');
