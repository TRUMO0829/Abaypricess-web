# Уулзалтын цаг захиалга (Google Calendar)

`/contact` хуудасны маягтын хажууд Google Calendar-ын **сул цагууд** харагдана. Үйлчлүүлэгч цаг сонгоод илгээхэд календарт уулзалт үүсч, түүний имэйлд урилга очно. Цаг сонгоогүй хүсэлт өмнөх шигээ имэйлээр явна.

## Хэрхэн ажилладаг вэ

| Хэсэг | Файл |
|---|---|
| Хуваарь (ажлын цаг, хугацаа, зай), текст | `src/content/booking.ts` |
| Сул цаг тооцох цэвэр функц | `src/lib/booking/slots.ts` (тест: `e2e/booking-slots.spec.ts`) |
| Google Calendar / туршилтын календарь | `src/lib/booking/calendar.ts` |
| Сул цагийн API (`GET /api/booking/availability` → эхлэх цаг бүр, `maxMinutes`) | `src/app/api/booking/availability/route.ts` |
| Захиалга үүсгэх Server Action | `src/lib/booking/actions.ts` |
| UI | `src/components/contact/meeting-picker.tsx`, `request-form.tsx` |

- Сул цагийг хуудас нээх, 60 секунд тутам, табыг дахин нээх бүрт Google-оос шинээр асууна (cache хийхгүй).
- Илгээхэд сервер тухайн цаг одоо ч сул эсэхийг дахин шалгана. Дүүрсэн бол "цаг дүүрсэн" гэж хариулж, сонголтыг цуцална.
- Нэвтрэх эрх (refresh token) зөвхөн серверт байна, хөтөч рүү гарахгүй.
- **Спамаас хамгаалалт:** нуугдмал (honeypot) талбар, IP тус бүрээс 10 минутад 5 захиалгын хязгаар. Хязгаар нь серверийн санах ойд хадгалагдах тул instance бүрт тусдаа тоологдоно.

### Хуваарь (`bookingConfig`)

| Тохиргоо | Утга |
|---|---|
| Ажлын өдөр, цаг | Даваа–Баасан, 08:00–18:00 (Улаанбаатар, UTC+8) |
| Уулзалтын хугацаа | 30 минутаас 1 цаг. Үйлчлүүлэгч эхлэх цагаа сонгоод дуусах цагаа 15 минутын алхмаар (30 / 45 / 60 минут) сонгоно. Дараагийн завгүй цаг хүртэл багтахгүй хугацаа идэвхгүй харагдана. |
| Бусад уулзалтаас авах зай | Завгүй цагийн **өмнө зай авахгүй** (уулзалт шууд залгаж болно). Завгүй цаг дууссаны **дараа 15 минут** (`bufferAfterMinutes`). |
| Цаг эхлэх алхам | 30 минут |
| Хамгийн эрт захиалах | 4 цагийн өмнө |
| Хамгийн хол | 14 хоногийн дотор |
| Уулзах хүн | Багийн гишүүд (`src/content/team.ts`, `id`-тай) эсвэл «Аль ч зөвлөх». Байгууллага нэг календарьтай тул сул цаг бүгдэд адилхан; сонголт уулзалтын гарчиг, тайлбар, имэйлд орно. |
| Уулзах газар | Очиж уулзах (харилцагчийн хаяг заавал), оффист урих (`company.contact.address`), онлайн — манай байнгын Zoom холбоос (`ZOOM_MEETING_URL`) урилга, баталгаажуулалтад орно. |

### Горимууд

- **Google:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` гурвуулаа тохируулагдсан үед.
- **Google, зөвхөн унших (API key):** OAuth тохируулаагүй, `GOOGLE_CALENDAR_API_KEY` + `GOOGLE_CALENDAR_ID` байгаа үед. Сул цаг бодитоор харагдана, гэхдээ календарьт уулзалт **үүсэхгүй**: сервер цаг сул эсэхийг шалгаад, сонгосон цаг бүхий хүсэлтийн имэйлийг (mailto) нээнэ. Уулзах хүн цагийг өөрөө баталгаажуулна. Доорх «API key горим»-ыг үз.
- **Туршилтын календарь:** dev горимд (`npm run dev`) эсвэл `BOOKING_MOCK=1` үед. Жишээ завгүй цагууд харагдах ба UI дээр "Туршилтын горим" гэж бичигдэнэ. e2e тест энэ горимоор ажиллана.
- **Тохиргоогүй production:** цаг захиалгын хэсэг "түр боломжгүй" гэж харагдана. Маягт имэйлээр ажилласаар байна.

## Google-ийн тохиргоо (нэг удаа, ≈15 минут)

Календарь эзэмшигчийн **хувийн Gmail** бүртгэлээр хийнэ.

1. **Төсөл үүсгэх:** [console.cloud.google.com](https://console.cloud.google.com) → шинэ төсөл (ж: `adapt-website`).
2. **API асаах:** APIs & Services → Library → **Google Calendar API** → Enable. Үнэгүй, карт холбох шаардлагагүй.
3. **Зөвшөөрлийн дэлгэц** (Google Auth Platform / OAuth consent screen):
   - User type: **External**. App name: `Adapt Management вебсайт`. Support email: өөрийн Gmail.
   - Data access (Scopes): `.../auth/calendar.events`, `.../auth/calendar.freebusy`.
   - Audience: **Publish app → In production** болгоно.
     > ⚠️ "Testing" горимд үлдээвэл refresh token **7 хоногийн дараа хүчингүй болж**, цаг захиалга зогсоно.

     Апп баталгаажаагүй тул нэвтрэх үед "Google hasn't verified this app" гэж гарна. Энэ апп-ыг зөвхөн эзэмшигч өөрөө нэг удаа зөвшөөрөх тул **Advanced → Go to … (unsafe)** дарж үргэлжлүүлнэ.
4. **Нэвтрэх түлхүүр:** Credentials → Create credentials → **OAuth client ID** → Application type: **Desktop app** → Client ID, Client secret-ийг хуулна.
5. **Refresh token авах** (төслийн хавтсанд):
   ```bash
   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/google-calendar-token.mjs
   ```
   - Хэвлэгдсэн холбоосоор календарь эзэмшигчийн Gmail-ээр нэвтэрч зөвшөөрнө.
   - Terminal-д `GOOGLE_REFRESH_TOKEN=...` гарна.
   - `invalid_scope` алдаа гарвал 3-р алхамд scope-уудаа шалгана.
6. **Env тохируулах:**
   - Локалд: `.env.local`
   - Vercel дээр: Project → Settings → Environment Variables, **Production** орчинд.
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REFRESH_TOKEN=...
   # GOOGLE_CALENDAR_ID=   # хоосон бол үндсэн (primary) календарь
   ```
7. **Шалгах:** `/contact` дээр "Туршилтын горим" бичиг алга болж, календарийн бодит сул цагууд харагдана.

## API key горим (зөвхөн сул цаг, ≈5 минут)

OAuth-ын оронд түр хэрэглэх хялбар хувилбар.

1. Cloud Console → **Google Calendar API** асаалттай байх (дээрх 1–2-р алхам).
2. Credentials → Create credentials → **API key**. Restrictions:
   - API restrictions: **Google Calendar API** л сонгоно.
   - Application restrictions: **None** (эсвэл серверийн IP). ⚠️ «Websites (HTTP referrers)» сонговол сервер талын хүсэлт 403 болно.
3. Календарийг public болгох: Google Calendar → Settings → тухайн календарь → Access permissions → **Make available to public** → **See only free/busy (hide details)**. Уулзалтын нэр, агуулга ил гарахгүй, зөвхөн завгүй цаг харагдана.
4. Settings → Integrate calendar → **Calendar ID**-г хуулна (үндсэн календарийнх нь Gmail хаяг).
5. Env:
   ```
   GOOGLE_CALENDAR_API_KEY=...
   GOOGLE_CALENDAR_ID=name@gmail.com
   ```
6. Шалгах: `npm run build && npm start` (dev горимд ч ажиллана) → `/contact`. Алдаа гарвал серверийн log-д `Google freeBusy: [{"reason":"notFound"}]` — календарь public биш эсвэл ID буруу.

Дараа нь OAuth-ын гурван утгыг нэмбэл автоматаар бүрэн захиалгын горимд шилжинэ.

## Аюулгүй байдал

- Refresh token нь календарьт уулзалт нэмэх эрхтэй нууц түлхүүр. Git-д оруулахгүй (`.env*` нь `.gitignore`-д байгаа) бөгөөд хэнтэй ч хуваалцахгүй.
- Эрхийг цуцлах: [myaccount.google.com/permissions](https://myaccount.google.com/permissions) → апп-ыг устгана. Дараа нь 5-р алхмыг давтаж шинэ token авна.
- Сайт календарийн **завгүй цагийг л** уншина. Уулзалтын нэр, агуулга хөтөч рүү дамжихгүй.
