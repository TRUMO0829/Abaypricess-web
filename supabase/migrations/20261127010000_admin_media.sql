-- Админаас оруулсан зураг (багийн гишүүн, сургагч багшийн зураг). Сайт `/media/<id>`-ээр уншина.
-- `20261127000000_admin_panel.sql`-ийн дараа ажиллуулна (admin_session_user шаардлагатай).

create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp')),
  data bytea not null,
  created_at timestamptz not null default now(),
  created_by text not null
);

alter table public.site_media enable row level security;
revoke all on public.site_media from anon, authenticated;

-- p_data: base64. 2MB-аас их зургийг хүлээж авахгүй.
create or replace function public.admin_upload_media(p_token text, p_mime text, p_data text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare
  v_user text := public.admin_session_user(p_token);
  v_bytes bytea;
  v_id uuid;
begin
  if v_user is null then raise exception 'unauthorized'; end if;
  if p_mime not in ('image/jpeg', 'image/png', 'image/webp') then raise exception 'bad_type'; end if;
  v_bytes := decode(coalesce(p_data, ''), 'base64');
  if octet_length(v_bytes) = 0 then raise exception 'empty'; end if;
  if octet_length(v_bytes) > 2000000 then raise exception 'too_large'; end if;
  insert into public.site_media(mime, data, created_by) values (p_mime, v_bytes, v_user) returning id into v_id;
  return v_id;
end $$;

-- Нийтэд харагдах зураг тул хэн ч уншиж болно
create or replace function public.get_media(p_id uuid)
returns table(mime text, data text)
language sql stable security definer set search_path = public as $$
  select mime, encode(data, 'base64') from public.site_media where id = p_id
$$;

revoke all on function public.admin_upload_media(text, text, text), public.get_media(uuid) from public;
grant execute on function public.admin_upload_media(text, text, text), public.get_media(uuid) to anon, authenticated;
