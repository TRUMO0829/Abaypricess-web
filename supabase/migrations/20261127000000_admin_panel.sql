-- Админы хэсэг (/admin): админ хэрэглэгч, session, сайтын текстийн засвар.
-- Хүснэгтүүд RLS-тэй, policy-гүй — сайт зөвхөн доорх SECURITY DEFINER функцуудыг publishable key-ээр дуудна.
-- Админ нэмэх (нууц үгийг энд бичихгүй, SQL Editor-т гараар):
--   insert into public.admin_users(username, password_hash)
--   values ('admin', extensions.crypt('НУУЦ_ҮГ', extensions.gen_salt('bf', 10)));

create table public.admin_users (
  username text primary key,
  password_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table public.admin_sessions (
  token_hash text primary key,
  username text not null references public.admin_users(username) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.site_content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.site_content enable row level security;
revoke all on public.admin_users, public.admin_sessions, public.site_content from anon, authenticated;

-- Нэвтрэх: зөв бол 12 цагийн token (session-д зөвхөн sha256 нь хадгалагдана). 5 буруу оролдлого → 15 минут түгжинэ.
create or replace function public.admin_login(p_username text, p_password text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.admin_users;
  v_token text;
begin
  select * into u from public.admin_users where username = lower(trim(p_username)) for update;
  if not found then
    -- Хэрэглэгч байгаа эсэхийг хугацаагаар таахаас сэргийлнэ
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 10));
    return null;
  end if;
  if u.locked_until is not null and u.locked_until > now() then
    raise exception 'locked';
  end if;
  if u.password_hash <> extensions.crypt(p_password, u.password_hash) then
    update public.admin_users
      set failed_attempts = failed_attempts + 1,
          locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else null end
      where username = u.username;
    return null;
  end if;
  update public.admin_users set failed_attempts = 0, locked_until = null where username = u.username;
  delete from public.admin_sessions where expires_at < now();
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.admin_sessions(token_hash, username, expires_at)
    values (encode(extensions.digest(v_token, 'sha256'), 'hex'), u.username, now() + interval '12 hours');
  return v_token;
end $$;

create or replace function public.admin_session_user(p_token text)
returns text language sql stable security definer set search_path = public, extensions as $$
  select username from public.admin_sessions
  where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex') and expires_at > now()
$$;

create or replace function public.admin_logout(p_token text)
returns void language sql security definer set search_path = public, extensions as $$
  delete from public.admin_sessions where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

-- Бүртгүүлсэн харилцагчид (нууц үгийн hash-гүй)
create or replace function public.admin_list_accounts(p_token text)
returns table(id uuid, created_at timestamptz, name text, company text, "position" text, phone text, last_login_at timestamptz)
language plpgsql stable security definer set search_path = public, extensions as $$
begin
  if public.admin_session_user(p_token) is null then raise exception 'unauthorized'; end if;
  return query select a.id, a.created_at, a.name, a.company, a.position, a.phone, a.last_login_at
    from public.accounts a order by a.created_at desc;
end $$;

-- Хэсгийн текстийг хадгална; p_data null бол кодын анхны текст рүү буцаана
create or replace function public.admin_save_content(p_token text, p_key text, p_data jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_user text := public.admin_session_user(p_token);
begin
  if v_user is null then raise exception 'unauthorized'; end if;
  if p_key !~ '^[a-z][a-z0-9_-]{0,40}$' then raise exception 'bad_key'; end if;
  if p_data is not null and octet_length(p_data::text) > 1000000 then raise exception 'too_large'; end if;
  if p_data is null then
    delete from public.site_content where key = p_key;
  else
    insert into public.site_content(key, data, updated_at, updated_by) values (p_key, p_data, now(), v_user)
      on conflict (key) do update set data = excluded.data, updated_at = now(), updated_by = v_user;
  end if;
end $$;

-- Нийтэд харагдах текст тул хэн ч уншиж болно
create or replace function public.get_site_content()
returns table(key text, data jsonb, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select key, data, updated_at from public.site_content
$$;

revoke all on function public.admin_login(text, text), public.admin_session_user(text), public.admin_logout(text),
  public.admin_list_accounts(text), public.admin_save_content(text, text, jsonb), public.get_site_content() from public;
grant execute on function public.admin_login(text, text), public.admin_session_user(text), public.admin_logout(text),
  public.admin_list_accounts(text), public.admin_save_content(text, text, jsonb), public.get_site_content() to anon, authenticated;
