-- ═════════════════════════════════════════════════════════════
--  Brew Lab: customer feedback
--  Run this once in Supabase → SQL Editor (after schema.sql).
-- ═════════════════════════════════════════════════════════════

create table public.feedback (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users on delete set null,
  order_id    bigint references public.orders on delete set null,
  rating      int  not null check (rating between 1 and 5),
  topics      text[] not null default '{}',
  comment     text check (char_length(comment) <= 1000),
  name        text check (char_length(name) <= 80),
  contact     text check (char_length(contact) <= 120),
  lang        text not null default 'en',
  seen        boolean not null default false
);
create index feedback_created_idx on public.feedback (created_at desc);

-- Anyone can send feedback (signed in or not), only through this function.
create function public.submit_feedback(
  p_rating int, p_topics text[], p_comment text, p_name text, p_contact text,
  p_order_id bigint default null, p_lang text default 'en'
) returns bigint
language plpgsql security definer set search_path = public as $$
declare new_id bigint;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then raise exception 'Choose a rating from 1 to 5'; end if;
  -- only link an order that exists
  if p_order_id is not null and not exists (select 1 from public.orders where id = p_order_id) then
    p_order_id := null;
  end if;
  insert into public.feedback (user_id, order_id, rating, topics, comment, name, contact, lang)
  values (auth.uid(), p_order_id, p_rating,
          coalesce(p_topics[1:10], '{}'),
          nullif(trim(left(p_comment, 1000)), ''),
          nullif(trim(left(p_name, 80)), ''),
          nullif(trim(left(p_contact, 120)), ''),
          coalesce(p_lang, 'en'))
  returning id into new_id;
  return new_id;
end $$;

-- Staff mark feedback as read
create function public.mark_feedback_seen(p_id bigint, p_seen boolean default true) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Staff only'; end if;
  update public.feedback set seen = p_seen where id = p_id;
end $$;

alter table public.feedback enable row level security;
-- Only staff can read feedback. Nobody can write to the table directly.
create policy "staff read feedback" on public.feedback for select using (public.is_staff());

revoke execute on function public.submit_feedback(int, text[], text, text, text, bigint, text) from public;
revoke execute on function public.mark_feedback_seen(bigint, boolean) from public;
grant execute on function public.submit_feedback(int, text[], text, text, text, bigint, text) to anon, authenticated;
grant execute on function public.mark_feedback_seen(bigint, boolean) to authenticated;
