-- Үйлчилгээний PDF материал (гэрээ, хөтөлбөр, тайлан). `20261127010000_admin_media.sql`-ийн дараа ажиллуулна.
-- Зураг 2MB, PDF 4MB хүртэл.

alter table public.site_media drop constraint if exists site_media_mime_check;
alter table public.site_media add constraint site_media_mime_check
  check (mime in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf'));

create or replace function public.admin_upload_media(p_token text, p_mime text, p_data text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare
  v_user text := public.admin_session_user(p_token);
  v_bytes bytea;
  v_max integer := 2000000;
  v_id uuid;
begin
  if v_user is null then raise exception 'unauthorized'; end if;
  if p_mime not in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf') then raise exception 'bad_type'; end if;
  v_bytes := decode(coalesce(p_data, ''), 'base64');
  if octet_length(v_bytes) = 0 then raise exception 'empty'; end if;
  if p_mime = 'application/pdf' then v_max := 4000000; end if;
  if octet_length(v_bytes) > v_max then raise exception 'too_large'; end if;
  insert into public.site_media(mime, data, created_by) values (p_mime, v_bytes, v_user) returning id into v_id;
  return v_id;
end $$;

revoke all on function public.admin_upload_media(text, text, text) from public;
grant execute on function public.admin_upload_media(text, text, text) to anon, authenticated;
