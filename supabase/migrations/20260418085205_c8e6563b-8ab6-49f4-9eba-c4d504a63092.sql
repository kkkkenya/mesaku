-- Create newsletter-images storage bucket (public read)
insert into storage.buckets (id, name, public)
values ('newsletter-images', 'newsletter-images', true)
on conflict (id) do nothing;

-- RLS policies on storage.objects for this bucket
-- Public read access
create policy "Newsletter images are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'newsletter-images');

-- Only admins can upload
create policy "Admins can upload newsletter images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'newsletter-images' and public.is_admin());

-- Only admins can update
create policy "Admins can update newsletter images"
on storage.objects
for update
to authenticated
using (bucket_id = 'newsletter-images' and public.is_admin());

-- Only admins can delete
create policy "Admins can delete newsletter images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'newsletter-images' and public.is_admin());