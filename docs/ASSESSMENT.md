# Байгууллагын үнэлгээ (`/assessment`)

Үйлчилгээ бүрийн «Үнэлгээний асуулт» tab болон footer-ийн холбоос. Байгууллагын төлөөлөгч асуулгыг бөглөж илгээнэ. Оноо **бөглөгчид харагдахгүй**: хариулт Supabase-д хадгалагдаж, Adapt-ийн зөвлөхүүд үзнэ. Шинэ үнэлгээ ирэх бүрт имэйл мэдэгдэл очно (Resend, заавал биш).

## Асуулт нэмэх, засах

Бүх асуулт `src/content/assessment.ts`-д байна. Код өөрчлөх шаардлагагүй.

- **Бүлэг (`sections`)**: асуулгын нэг алхам. Бүлгийн тоо, асуултын тоо хязгааргүй (ж: 10 бүлэг × 36 = 360 асуулт).
- **`id`**: давтагдахгүй, нийтэлсний дараа өөрчлөхгүй (ж: `hr-12`). Ноорог болон хадгалсан хариулт id-аар холбогдоно.
- **`weight` (жин)**: асуулт бүрийн нийт оноонд эзлэх жин. Default 1. 0 бол оноонд орохгүй.
- **`required`**: default `true` (`text` төрөлд `false`).
- **`version`**: асуулт нэмэх/хасах, жин өөрчлөх бүрт ахиулна. Хадгалсан мөр бүр аль хувилбараар бөглөгдсөнийг заана. Хувилбар солигдоход хөтөч дээрх хуучин ноорог хэрэглэгдэхгүй.

| Төрөл | Жишээ | Оноо (0–1) |
|---|---|---|
| `scale` | 1–5, 0–10 (`min`, `max`, `minLabel`, `maxLabel`) | `(утга − min) / (max − min)`. `reverse: true` бол эсрэгээр |
| `yesno` | Тийм / Үгүй | Тийм = 1, Үгүй = 0. `reverse: true` бол эсрэгээр |
| `choice` | `options: [{ label, points }]` | `points / хамгийн их points`. Сонголт бүр өөрийн оноотой |
| `text` | Чөлөөт хариулт | Оноонд орохгүй |

Ихэнх асуулт «санал нийлэх 1–5» байх тул `agree(id, text, { weight })` товчлол ашиглана.

**Оноо:** бүлгийн оноо = Σ(жин × оноо) / Σ(жин) × 100. Нийт оноо = бүх асуултын жинлэсэн дундаж. Оноог сервер асуулгын тодорхойлолтоос дахин тооцдог (client-ийн илгээсэн оноонд итгэхгүй). Логик: `src/lib/assessment/scoring.ts`.

## Ажиллах зарчим

1. Хэрэглэгч байгууллагын мэдээлэл → бүлэг бүр → шалгах алхмаар явна. Бүлэг бүрийн заавал асуултад хариулахгүйгээр «Дараах» ажиллахгүй. Зүүн талын цэсээр бүлэг хооронд чөлөөтэй шилжинэ.
2. Хариулт хөтчийн `localStorage`-д ноорог болж хадгалагдах тул завсарлаад «Үргэлжлүүлэх» боломжтой.
3. «Үнэлгээ илгээх» → Server Action `submitAssessment()` (`src/lib/assessment/actions.ts`):
   - мэдээлэл, хариултыг дахин шалгана;
   - оноог тооцоод Supabase-ийн `assessment_submissions` хүснэгтэд нэг мөр нэмнэ;
   - `RESEND_API_KEY` байвал мэдэгдэл имэйл илгээнэ (амжилтгүй болсон ч үнэлгээ хадгалагдсан хэвээр).
4. Хамгаалалт: honeypot талбар, IP тус бүрээс 10 минутад 3 удаа.

## Supabase

Төсөл: `rrnabrxuugxqpicvldus` (abaycto7@gmail.com's Project). Хүснэгт `public.assessment_submissions`:

| Багана | Агуулга |
|---|---|
| `organization`, `industry`, `employees`, `contact_name`, `position`, `email`, `phone` | Байгууллагын мэдээлэл |
| `total_score` | Нийт оноо, 0–100 |
| `section_scores` | `[{ id, title, score, answered, questions }]` |
| `answers` | `[{ id, section, question, answer, score, weight }]`. Асуулт, хариултын текстээр хадгалдаг тул шууд уншигдана |
| `assessment_version`, `created_at` | Хувилбар, огноо |

**Үзэх:** [Supabase dashboard](https://supabase.com/dashboard/project/rrnabrxuugxqpicvldus/editor) → Table Editor → `assessment_submissions`. Export → CSV.

**Эрх (RLS):** сайт publishable (anon) key-ээр **зөвхөн INSERT** хийнэ. Унших, засах, устгах эрх байхгүй тул key ил гарсан ч хариултыг уншиж чадахгүй. Хүснэгтийг зөвхөн dashboard-оор (эзэмшигч) үзнэ.

## Env

```
SUPABASE_URL=https://rrnabrxuugxqpicvldus.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # Supabase → Project Settings → API Keys

# Имэйл мэдэгдэл (заавал биш)
RESEND_API_KEY=re_...
ASSESSMENT_NOTIFY_TO=info@adaptmanagement.mn   # хоосон бол company.contact.email; таслалаар олон хаяг
ASSESSMENT_NOTIFY_FROM="Adapt Management <noreply@adaptmanagement.mn>"
```

- Supabase-ийн env байхгүй үед: dev горимд санах ойд хадгална (туршилт), production-д «түр хаалттай» гэж харуулна.
- `ASSESSMENT_MOCK=1`: e2e тест. `.env.local`-д бодит түлхүүр байсан ч Supabase руу бичихгүй.

### Resend тохируулах

1. [resend.com](https://resend.com)-д бүртгүүлж (эсвэл Vercel → Marketplace → Resend) API key үүсгэнэ.
2. Домэйн баталгаажуулаагүй үед `from` нь `onboarding@resend.dev` байх ба имэйл **зөвхөн Resend бүртгэлийн эзэмшигчийн хаяг руу** очно. Тиймээс `ASSESSMENT_NOTIFY_TO`-д тэр хаягийг тавина.
3. `adaptmanagement.mn` домэйнийг Resend → Domains-д баталгаажуулсны дараа `ASSESSMENT_NOTIFY_FROM`, `ASSESSMENT_NOTIFY_TO`-г дурын хаягаар тохируулна.
