-- Run this ONCE in Supabase SQL Editor (after the first script). Adds MP3 uploads.

alter table public.submissions alter column link drop not null;
alter table public.submissions add column if not exists file_path text check (file_path ~ '^[A-Za-z0-9-]+\.mp3$');
alter table public.submissions add constraint link_or_file check (link is not null or file_path is not null);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 26214400, array['audio/mpeg', 'audio/mp3'])
on conflict (id) do nothing;

create policy "public can upload mp3" on storage.objects
  for insert to anon
  with check (bucket_id = 'submissions');

create policy "admin read mp3" on storage.objects
  for select to authenticated
  using (bucket_id = 'submissions');

create policy "admin delete mp3" on storage.objects
  for delete to authenticated
  using (bucket_id = 'submissions');
