-- ═════════════════════════════════════════════════════════════
--  Brew Lab — customers list + phone numbers
--  Run once in Supabase → SQL Editor, after editor.sql.
--
--  Adds:
--    profiles.whatsapp_offers   the customer agreed to get offers on WhatsApp
--    owner_list_customers()     owners see every member: name, email,
--                               phone, points, orders, joined, last visit
-- ═════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists whatsapp_offers boolean not null default false;

-- customers may change their own name, phone and WhatsApp-offers choice (nothing else)
revoke update on public.profiles from authenticated, anon;
grant  update (name, phone, whatsapp_offers) on public.profiles to authenticated;

create or replace function public.owner_list_customers()
returns table (
  id uuid, name text, email text, phone text, points int, whatsapp_offers boolean,
  orders bigint, joined timestamptz, last_sign_in timestamptz, signed_in_with text
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'Owners only'; end if;
  return query
    select p.id, p.name, u.email::text, p.phone, p.points, p.whatsapp_offers,
           (select count(*) from public.orders o where o.user_id = p.id and o.status <> 'cancelled'),
           p.created_at, u.last_sign_in_at,
           coalesce(u.raw_app_meta_data ->> 'provider', 'email')
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end $$;

revoke execute on function public.owner_list_customers() from public;
grant execute on function public.owner_list_customers() to authenticated;
