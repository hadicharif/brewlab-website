-- ═════════════════════════════════════════════════════════════
--  Brew Lab — "Social media" role
--  Run once in Supabase → SQL Editor, after editor.sql.
--
--  A social media person can open the editor and change ONLY the
--  Promos tab: the top announcement bar, the promo cards and the
--  best-sellers pop-up. No prices, menu, staff, rewards or orders.
-- ═════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists is_social boolean not null default false;

create or replace function public.is_social() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_social from public.profiles where id = auth.uid()), false)
$$;

-- who may save which part of the website
create or replace function public.owner_save(p_key text, p_value jsonb, p_summary text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_key not in ('menu', 'addons', 'shop', 'promos', 'announcements', 'bestsellers') then
    raise exception 'Unknown part: %', p_key;
  end if;
  if not (public.is_owner() or (public.is_social() and p_key in ('promos', 'announcements', 'bestsellers'))) then
    raise exception 'You don''t have permission to change this';
  end if;
  if p_value is null or jsonb_typeof(p_value) not in ('object', 'array') then raise exception 'Nothing to save'; end if;
  if length(p_value::text) > 200000 then raise exception 'Too much to save at once'; end if;
  insert into public.site_content (key, value, updated_at, updated_by)
  values (p_key, p_value, now(), auth.uid())
  on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = auth.uid();
  perform public.log_change(p_key, p_summary);
end $$;

-- team list now shows the social media role too
drop function if exists public.owner_list_team();
create function public.owner_list_team()
returns table (email text, name text, is_staff boolean, is_owner boolean, is_social boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'Owners only'; end if;
  return query
    select u.email::text, p.name, p.is_staff, p.is_owner, p.is_social
    from public.profiles p join auth.users u on u.id = p.id
    where p.is_staff or p.is_owner or p.is_social
    order by p.is_owner desc, p.is_staff desc, p.name nulls last;
end $$;

-- p_role: 'owner', 'staff', 'social' or 'none'
create or replace function public.owner_set_role(p_email text, p_role text) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid; nm text;
begin
  if not public.is_owner() then raise exception 'Owners only'; end if;
  if p_role not in ('owner', 'staff', 'social', 'none') then raise exception 'Unknown role'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if uid is null then raise exception 'No account with this email yet. Ask them to sign up on the website (Rewards) first.'; end if;
  if uid = auth.uid() and p_role <> 'owner' then raise exception 'You can''t remove yourself. Ask another owner to do it.'; end if;
  update public.profiles
     set is_owner  = (p_role = 'owner'),
         is_staff  = (p_role in ('owner', 'staff')),
         is_social = (p_role = 'social')
   where id = uid returning coalesce(name, p_email) into nm;
  perform public.log_change('staff', case p_role
    when 'owner'  then nm || ' is now an owner'
    when 'staff'  then nm || ' is now staff'
    when 'social' then nm || ' is now social media'
    else nm || ' was removed from the team' end);
  return nm;
end $$;

revoke execute on function public.owner_save(text, jsonb, text) from public;
revoke execute on function public.owner_list_team() from public;
revoke execute on function public.owner_set_role(text, text) from public;
grant execute on function public.is_social() to anon, authenticated;
grant execute on function public.owner_save(text, jsonb, text) to authenticated;
grant execute on function public.owner_list_team() to authenticated;
grant execute on function public.owner_set_role(text, text) to authenticated;
