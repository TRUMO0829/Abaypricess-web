# Админы хэсэг (`/admin`)

Вебсайтын бүх текст, багийн гишүүд, сургагч багш нар, холбоо барих мэдээллийг кодгүйгээр засах, бүртгүүлсэн харилцагчдыг харах хэсэг. Хайлтын системд индексжихгүй (`robots.txt`, `noindex`).

## Хуудсууд

| Route | Агуулга |
|---|---|
| `/admin/login` | Нэвтрэх нэр + нууц үг |
| `/admin` | Агуулгын 12 хэсэг (`src/lib/content/sections.ts`) |
| `/admin/content/[section]` | Хэсгийн засварын маягт: текст, жагсаалтад мөр нэмэх/хасах/зөөх, үнэ, «Хадгалах», «Анхны текст рүү буцаах» |
| `/admin/users` | Бүртгүүлсэн харилцагчид: нэр, компани, албан тушаал, утас, огноо. Хайлт, Excel (CSV) татах |

## Агуулга хэрхэн ажилладаг вэ

- Кодын `src/content/*.ts` нь **анхны (default) текст**. Админы засвар Supabase `site_content`-д хэсэг тус бүр нэг мөр (JSON) болж хадгалагдана.
- `getSiteContent()` (`src/lib/content/index.ts`) нь default дээр засварыг давхарлана (`merge`). Мөрүүдийг `"use cache"` + `cacheTag("site-content")`-оор cache хийж, админ хадгалахад `updateTag` → вебсайт шууд шинэчлэгдэнэ.
- Server Component бүр `await getSiteContent()`-оор текстээ авна; client component руу хэрэгтэй хэсгийг нь props-оор дамжуулна. **Шинэ текст нэмэхдээ** `src/content/`-д нэмээд, component-д `getSiteContent()`-оос уншина — админд автоматаар харагдана.
- Засагдахгүй утга (`src/lib/content/rules.ts`): `id`, `slug`, `href`, icon, асуултын төрөл/оноо/жин зэрэг бүтэц, логиктой холбоотой талбар. Хадгалахын өмнө сервер `sanitize()`-ээр зөвхөн default-д байгаа талбарыг зөв төрлөөр нь үлдээнэ.
- Мөр нэмэх боломжтой жагсаалт: баг, сургагч багш, хөтөлбөр, үнийн багц, процессын алхам, нууцлалын бодлогын бүлэг, «Цаашид юу болох вэ» алхам, тайлангийн бүлэг, бүх текстийн жагсаалт.
- `{count}`, `{name}` гэх мэт хаалттай үгийг тоо/нэрээр солино — засахдаа хадгална уу.
- Зураг: багийн гишүүн, сургагч багшийн «Зураг оруулах» товчоор (JPG/PNG/WebP, браузер дээр 800px хүртэл багасгаж JPEG болгоно). Supabase `site_media`-д хадгалагдаж `/media/<id>`-ээр (`src/app/media/[id]/route.ts`, удаан cache) харагдана. Мөн `/team/нэр.jpg` эсвэл `https://…` холбоос бичиж болно.
- Шинээр нэмсэн хүний «Ажлын туршлага», «Ур чадвар» хоосон эхэлнэ — «Мөр нэмэх»-ээр бөглөнө.

## Хадгалалт, аюулгүй байдал

- Migration: `supabase/migrations/20261127000000_admin_panel.sql` — `admin_users`, `admin_sessions`, `site_content` хүснэгт (RLS, policy-гүй) ба SECURITY DEFINER функцууд. Сайт зөвхөн publishable key ашиглана.
- Migration: `supabase/migrations/20261127010000_admin_media.sql` — зургийн `site_media` хүснэгт, `admin_upload_media`, `get_media` функц (дээрхийн дараа ажиллуулна).
- Нууц үг DB дотор **bcrypt**. 5 буруу оролдлого → 15 минут түгжинэ; сайт дээр IP тус бүрээс 15 минутад 10 буруу оролдлогын хязгаар.
- Session: санамсаргүй 32 байт token, `adapt_admin` HttpOnly, SameSite=Strict cookie (`/admin` зам, 12 цаг). DB-д зөвхөн sha256 нь хадгалагдаж, админы үйлдэл бүрт DB дотор шалгагдана.
- `get_site_content()` нийтэд нээлттэй (вебсайтын текст), бусад функц token шаардана. Харилцагчдын жагсаалтад нууц үгийн hash ордоггүй.

## Админ нэмэх, нууц үг солих

Supabase → SQL Editor:

```sql
-- Шинэ админ
insert into public.admin_users(username, password_hash)
values ('admin', extensions.crypt('ШинэНууцҮг', extensions.gen_salt('bf', 10)));

-- Нууц үг солих (бүх session хүчингүй болно)
update public.admin_users
set password_hash = extensions.crypt('ШинэНууцҮг', extensions.gen_salt('bf', 10)), failed_attempts = 0, locked_until = null
where username = 'admin';
delete from public.admin_sessions where username = 'admin';
```

## Env, тест

- Supabase-ийн `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (үнэлгээ, нэвтрэлттэй ижил). Нэмэлт нууц түлхүүр шаардлагагүй.
- `ADMIN_MOCK=1` + `ADMIN_DEV_PASSWORD`: санах ойн горим (e2e). `e2e/admin.spec.ts` — нэвтрэх, текст засах/буцаах, багийн гишүүн нэмэх, харилцагчдын жагсаалт.
