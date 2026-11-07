-- ═════════════════════════════════════════════════════════════
--  Brew Lab — database setup for Supabase
--  Paste this whole file into Supabase → SQL Editor → New query → Run.
--  It is safe to run once on a new project.
--
--  What it creates
--    settings        points per $1, welcome points, birthday window
--    reward_tiers    the rewards customers can swap points for
--    profiles        one row per customer account (name, birthday, points)
--    orders          every order sent from the website (with an order number)
--    redemptions     reward and birthday codes (BL-1234) and whether staff used them
--
--  How points stay fair
--    • Customers can never change their own points.
--    • Points are added only when STAFF confirm an order (confirm_order).
--    • Rewards and birthday drinks are issued by the database, which checks
--      the balance / the birthday window, and staff mark codes as used.
-- ═════════════════════════════════════════════════════════════

-- ─── Settings ────────────────────────────────────────────────
create table public.settings (
  id                   int primary key default 1 check (id = 1),  -- single row
  points_per_dollar    int not null default 10,
  welcome_points       int not null default 50,
  birthday_window_days int not null default 3
);
insert into public.settings default values;

create table public.reward_tiers (
  id        text primary key,
  points    int  not null check (points > 0),
  name_en   text not null,
  name_ar   text not null,
  active    boolean not null default true,
  sort      int not null default 0
);
insert into public.reward_tiers (id, points, name_en, name_ar, sort) values
  ('small',    250,  'Croissant or cookie',     'كرواسان أو كوكي',      1),
  ('coffee',   500,  'Any hot coffee',          'أي قهوة ساخنة',        2),
  ('cold',     750,  'Any frappé or milkshake', 'أي فرابيه أو ميلك شيك', 3),
  ('sandwich', 1000, 'Any sandwich',            'أي سندويش',            4);

-- ─── Customer accounts ───────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text,
  phone         text,
  birthday      date,
  points        int  not null default 0 check (points >= 0),
  birthday_year int,                       -- year the birthday drink was last used
  is_staff      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ─── Orders ──────────────────────────────────────────────────
create table public.orders (
  id            bigint generated always as identity (start with 1001) primary key,  -- order number
  user_id       uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  phone         text,
  order_type    text not null check (order_type in ('pickup', 'delivery')),
  address       text,
  pickup_time   text,
  notes         text,
  items         jsonb not null,            -- [{ name, details, qty, price }]
  total         numeric(10,2),             -- null when some items have no price
  lang          text not null default 'en',
  status        text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  points        int  not null default 0,   -- points given when confirmed
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz,
  confirmed_by  uuid references public.profiles (id)
);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_user_idx   on public.orders (user_id, created_at desc);

-- ─── Reward and birthday codes ───────────────────────────────
create table public.redemptions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null check (kind in ('reward', 'birthday')),
  tier_id    text references public.reward_tiers (id),
  points     int  not null default 0,
  code       text not null unique,
  status     text not null default 'issued' check (status in ('issued', 'used')),
  created_at timestamptz not null default now(),
  used_at    timestamptz,
  used_by    uuid references public.profiles (id)
);
create index redemptions_user_idx on public.redemptions (user_id, created_at desc);

-- ═════════════════════════════════════════════════════════════
--  Helper functions
-- ═════════════════════════════════════════════════════════════

-- today in Lebanon
create function public.today_beirut() returns date
language sql stable as $$ select (now() at time zone 'Asia/Beirut')::date $$;

-- is the signed-in user a staff member?
create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_staff from public.profiles where id = auth.uid()), false)
$$;

-- new unique code like BL-4821
create function public.new_code() returns text
language plpgsql volatile set search_path = public as $$
declare c text;
begin
  loop
    c := 'BL-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
    exit when not exists (select 1 from public.redemptions where code = c);
  end loop;
  return c;
end $$;

-- days between today and the nearest birthday (negative = birthday has passed)
create function public.days_to_birthday(b date) returns int
language plpgsql stable as $$
declare
  t date := public.today_beirut();
  best int := null;
  y int;
  d date;
begin
  if b is null then return null; end if;
  for y in extract(year from t)::int - 1 .. extract(year from t)::int + 1 loop
    -- adding years handles 29 February (becomes 28 February)
    d := (b + make_interval(years => y - extract(year from b)::int))::date;
    if best is null or abs(d - t) < abs(best) then best := d - t; end if;
  end loop;
  return best;
end $$;

-- ═════════════════════════════════════════════════════════════
--  New accounts get a profile and the welcome points
-- ═════════════════════════════════════════════════════════════
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    (select welcome_points from public.settings where id = 1)
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═════════════════════════════════════════════════════════════
--  Actions the website calls
-- ═════════════════════════════════════════════════════════════

-- Save an order (anyone, signed in or not). Returns the order number.
create function public.place_order(
  p_customer_name text, p_phone text, p_order_type text, p_address text,
  p_pickup_time text, p_notes text, p_items jsonb, p_total numeric, p_lang text
) returns bigint
language plpgsql security definer set search_path = public as $$
declare new_id bigint;
begin
  if coalesce(trim(p_customer_name), '') = '' then raise exception 'Name is required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Order is empty'; end if;
  insert into public.orders (user_id, customer_name, phone, order_type, address, pickup_time, notes, items, total, lang)
  values (auth.uid(), trim(p_customer_name), p_phone, p_order_type, p_address, p_pickup_time, p_notes, p_items, p_total, coalesce(p_lang, 'en'))
  returning id into new_id;
  return new_id;
end $$;

-- STAFF: confirm an order (picked up / paid). Adds the points once.
create function public.confirm_order(p_order_id bigint, p_total numeric default null) returns int
language plpgsql security definer set search_path = public as $$
declare
  o public.orders;
  pts int := 0;
  ppd int := (select points_per_dollar from public.settings where id = 1);
begin
  if not public.is_staff() then raise exception 'Staff only'; end if;
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status <> 'pending' then raise exception 'Order is already %', o.status; end if;

  -- staff can enter the final total when some items had no price
  if p_total is not null then o.total := p_total; end if;
  if o.user_id is not null and o.total is not null then
    pts := floor(o.total)::int * ppd;
    update public.profiles set points = points + pts where id = o.user_id;
  end if;

  update public.orders
     set status = 'confirmed', total = o.total, points = pts,
         confirmed_at = now(), confirmed_by = auth.uid()
   where id = p_order_id;
  return pts;
end $$;

-- STAFF: cancel an order (no points)
create function public.cancel_order(p_order_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Staff only'; end if;
  update public.orders set status = 'cancelled', confirmed_at = now(), confirmed_by = auth.uid()
   where id = p_order_id and status = 'pending';
  if not found then raise exception 'Order not found or not pending'; end if;
end $$;

-- CUSTOMER: swap points for a reward. Returns the code to show at the counter.
create function public.redeem_reward(p_tier_id text) returns text
language plpgsql security definer set search_path = public as $$
declare
  t public.reward_tiers;
  c text;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into t from public.reward_tiers where id = p_tier_id and active;
  if not found then raise exception 'Reward not found'; end if;

  update public.profiles set points = points - t.points
   where id = auth.uid() and points >= t.points;
  if not found then raise exception 'Not enough points'; end if;

  c := public.new_code();
  insert into public.redemptions (user_id, kind, tier_id, points, code)
  values (auth.uid(), 'reward', t.id, t.points, c);
  return c;
end $$;

-- CUSTOMER: get the birthday drink (around the birthday, once a year)
create function public.redeem_birthday() returns text
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles;
  win int := (select birthday_window_days from public.settings where id = 1);
  yr int := extract(year from public.today_beirut())::int;
  c text;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into p from public.profiles where id = auth.uid() for update;
  if p.birthday is null then raise exception 'Add your birthday first'; end if;
  if abs(public.days_to_birthday(p.birthday)) > win then raise exception 'Not your birthday week yet'; end if;
  if p.birthday_year = yr then raise exception 'Birthday drink already used this year'; end if;

  update public.profiles set birthday_year = yr where id = auth.uid();
  c := public.new_code();
  insert into public.redemptions (user_id, kind, code) values (auth.uid(), 'birthday', c);
  return c;
end $$;

-- CUSTOMER: set the birthday (only once, so it can't be changed to get extra drinks)
create function public.set_birthday(p_birthday date) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  update public.profiles set birthday = p_birthday where id = auth.uid() and birthday is null;
  if not found then raise exception 'Birthday is already set. Ask staff to change it.'; end if;
end $$;

-- STAFF: check a code at the counter and mark it used. Returns what it is for.
create function public.use_code(p_code text)
returns table (kind text, reward text, customer text, status text)
language plpgsql security definer set search_path = public as $$
declare r public.redemptions;
begin
  if not public.is_staff() then raise exception 'Staff only'; end if;
  select * into r from public.redemptions where code = upper(trim(p_code)) for update;
  if not found then raise exception 'Code not found'; end if;
  if r.status = 'used' then raise exception 'Code was already used on %', to_char(r.used_at at time zone 'Asia/Beirut', 'DD Mon HH24:MI'); end if;
  update public.redemptions set status = 'used', used_at = now(), used_by = auth.uid() where id = r.id;
  return query
    select r.kind,
           coalesce((select name_en from public.reward_tiers where id = r.tier_id), 'Birthday drink'),
           (select name from public.profiles where id = r.user_id),
           'used'::text;
end $$;

-- ═════════════════════════════════════════════════════════════
--  Security: who can read and change what (Row Level Security)
-- ═════════════════════════════════════════════════════════════
alter table public.settings     enable row level security;
alter table public.reward_tiers enable row level security;
alter table public.profiles     enable row level security;
alter table public.orders       enable row level security;
alter table public.redemptions  enable row level security;

-- everyone can read the rules
create policy "read settings" on public.settings     for select using (true);
create policy "read tiers"    on public.reward_tiers for select using (true);
-- staff can change the rules
create policy "staff edit settings" on public.settings     for update using (public.is_staff());
create policy "staff edit tiers"    on public.reward_tiers for all    using (public.is_staff()) with check (public.is_staff());

-- customers see their own profile; staff see everyone
create policy "own profile"       on public.profiles for select using (id = auth.uid() or public.is_staff());
-- customers may edit only their name and phone (see column grants below)
create policy "edit own profile"  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "staff edit profiles" on public.profiles for update using (public.is_staff());

-- customers see their own orders; staff see all (orders are created through place_order)
create policy "own orders" on public.orders for select using (user_id = auth.uid() or public.is_staff());

-- customers see their own codes; staff see all (codes are created through the functions)
create policy "own codes" on public.redemptions for select using (user_id = auth.uid() or public.is_staff());

-- column-level: signed-in users can only update name and phone themselves
revoke update on public.profiles from authenticated, anon;
grant  update (name, phone) on public.profiles to authenticated;

-- the website may call these actions
grant execute on function public.place_order(text, text, text, text, text, text, jsonb, numeric, text) to anon, authenticated;
grant execute on function public.redeem_reward(text)              to authenticated;
grant execute on function public.redeem_birthday()                to authenticated;
grant execute on function public.set_birthday(date)               to authenticated;
grant execute on function public.confirm_order(bigint, numeric)   to authenticated;  -- checks is_staff inside
grant execute on function public.cancel_order(bigint)             to authenticated;  -- checks is_staff inside
grant execute on function public.use_code(text)                   to authenticated;  -- checks is_staff inside

-- ═════════════════════════════════════════════════════════════
--  After running: make yourself staff
--  1. Sign in once on the website (or add yourself in Authentication → Users).
--  2. Run (with your email):
--       update public.profiles set is_staff = true
--       where id = (select id from auth.users where email = 'you@example.com');
-- ═════════════════════════════════════════════════════════════
