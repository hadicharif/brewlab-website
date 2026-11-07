-- ═════════════════════════════════════════════════════════════
--  Brew Lab: e-loyalty card (QR)
--  Run this once in Supabase → SQL Editor (after schema.sql).
--  Every customer gets a card number. Staff scan it at the
--  counter to add points for in-store purchases.
-- ═════════════════════════════════════════════════════════════

-- card numbers like K7Q2MX9P (no 0/O or 1/I, so they're easy to read out)
create function public.new_card_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  abc text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..8 loop
      c := c || substr(abc, 1 + floor(random() * length(abc))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where card_code = c);
  end loop;
  return c;
end $$;

alter table public.profiles add column card_code text;
update public.profiles set card_code = public.new_card_code() where card_code is null;
alter table public.profiles alter column card_code set default public.new_card_code();
alter table public.profiles alter column card_code set not null;
alter table public.profiles add constraint profiles_card_code_key unique (card_code);

-- in-store purchases are saved as orders of type 'instore'
alter table public.orders drop constraint orders_order_type_check;
alter table public.orders add constraint orders_order_type_check
  check (order_type in ('pickup', 'delivery', 'instore'));

-- clean what the scanner or staff typed: "k7q2-mx9p" → "K7Q2MX9P"
create function public.clean_card_code(p text) returns text
language sql immutable as $$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'))
$$;

-- STAFF: look up a card
create function public.staff_find_card(p_code text)
returns table (name text, points int, card_code text, birthday_ready boolean, member_since timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare
  win int := (select birthday_window_days from public.settings where id = 1);
  yr  int := extract(year from public.today_beirut())::int;
begin
  if not public.is_staff() then raise exception 'Staff only'; end if;
  return query
    select p.name, p.points, p.card_code,
           (p.birthday is not null
             and abs(public.days_to_birthday(p.birthday)) <= win
             and coalesce(p.birthday_year, 0) <> yr),
           p.created_at
      from public.profiles p
     where p.card_code = public.clean_card_code(p_code);
  if not found then raise exception 'Card not found'; end if;
end $$;

-- STAFF: add points for an in-store purchase
create function public.staff_add_purchase(p_code text, p_amount numeric)
returns table (order_id bigint, points_added int, new_points int, customer text)
language plpgsql security definer set search_path = public as $$
declare
  prof public.profiles;
  ppd  int := (select points_per_dollar from public.settings where id = 1);
  pts  int;
  oid  bigint;
begin
  if not public.is_staff() then raise exception 'Staff only'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000 then
    raise exception 'Enter the purchase total in dollars (more than 0)';
  end if;
  select * into prof from public.profiles where card_code = public.clean_card_code(p_code) for update;
  if not found then raise exception 'Card not found'; end if;

  pts := floor(p_amount)::int * ppd;
  update public.profiles set points = points + pts where id = prof.id;
  insert into public.orders (user_id, customer_name, order_type, items, total, status, points, confirmed_at, confirmed_by)
  values (prof.id, coalesce(prof.name, 'Member'), 'instore',
          jsonb_build_array(jsonb_build_object('name', 'In-store purchase', 'details', null, 'qty', 1, 'price', p_amount)),
          p_amount, 'confirmed', pts, now(), auth.uid())
  returning id into oid;

  return query select oid, pts, prof.points + pts, prof.name;
end $$;

revoke execute on function public.new_card_code() from public;
revoke execute on function public.staff_find_card(text) from public;
revoke execute on function public.staff_add_purchase(text, numeric) from public;
grant execute on function public.staff_find_card(text) to authenticated;            -- checks is_staff inside
grant execute on function public.staff_add_purchase(text, numeric) to authenticated; -- checks is_staff inside
