-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  artist text not null check (char_length(artist) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  title text not null check (char_length(title) between 1 and 200),
  genre text check (char_length(genre) <= 60),
  link text not null check (link ~* '^https?://' and char_length(link) <= 500),
  message text check (char_length(message) <= 2000),
  rights_confirmed boolean not null default false check (rights_confirmed),
  status text not null default 'queued' check (status in ('queued','listening','played','skipped'))
);

alter table public.submissions enable row level security;

-- Anyone visiting the site can add a submission, but only as 'queued'.
create policy "public can submit" on public.submissions
  for insert to anon
  with check (status = 'queued');

-- Only logged-in admin (you) can view / update / delete the queue.
create policy "admin read" on public.submissions for select to authenticated using (true);
create policy "admin update" on public.submissions for update to authenticated using (true) with check (true);
create policy "admin delete" on public.submissions for delete to authenticated using (true);
