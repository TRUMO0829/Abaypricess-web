# Архитектур

Адапт Менежмент ХХК (Adapt Management)-ийн албан ёсны вебсайт. Эх brief: `docs/brief/brief.txt`, диаграмм: `docs/brief/process-diagram.png`.

> Брэндийн нэр 2026-11-15-нд захиалагчийн хүсэлтээр "Абая Прайсэс"-ээс "Adapt Management" болж өөрчлөгдсөн. 2026-11-17-нд албан ёсны лого ирж (`docs/brief/adapt-logo.png`), брэнд өнгө нь логоны нил ягаан болсон. `docs/brief/` дахь бусад эх материал (brief, хуучин `logo.png`) хуучин нэртэйгээ үлдэнэ. Компанийн нэр `src/content/company.ts`-д, логоны asset `src/lib/brand.ts` + `public/brand/`-д байна.

> 2026-11-17-ны захиалагчийн 1-р засвар: тайлангийн загварын хуудас (`/report`) вебээс бүрэн хасагдсан. Урсгалын диаграмм зөвхөн үндсэн 3 үйлчилгээг (Training, Laboratory, Update) дугаар, сум, эхлэх/дуусах тэмдэглэгээгүй харуулна. Тоон үзүүлэлтийн хэсэг хасагдсан. `/about` дээр багийн гишүүд (`src/content/team.ts`) нэмэгдсэн.

> 2026-11-18-ны 2-р засвар: «1 мэдээлэл = 1 хуудас». Үйлчилгээний хуудас дэд хуудсуудад хуваагдаж, толгойн товчны доор цэс (`ServiceTabs`, `getServiceTabs()`) байрлана. Тайлангийн загвар үйлчилгээ бүрийн «Тайлан» tab-д буцаж орсон. Сургалтад сургагч багш нарын CV (`Service.trainers`) нэмэгдсэн. Хүний карт `components/shared/person-card.tsx`.

> 2026-11-18-ны 3-р засвар: `/about` хуудас хасагдсан. Бидний тухай мэдээлэл нүүр хуудсанд байгаа тул «Манай баг» нүүр рүү шилжиж, цэс/footer-аас «Бидний тухай» холбоос хасагдсан.

## Стек

- Next.js 16 (App Router, Turbopack, **Cache Components** + Partial Prefetching идэвхтэй)
- React 19, TypeScript (strict)
- Tailwind CSS v4 (`src/app/globals.css`-д token; `tailwind.config` байхгүй)
- shadcn/ui (`radix-nova` style, Radix primitives, `lucide-react` icon)
- react-hook-form + zod v4 (маягт)
- Загвар: [shadcn-landing-page](https://github.com/leoMirandaa/shadcn-landing-page) (Vite/React/Tailwind v3) — section-уудыг Next.js + Tailwind v4 руу port хийнэ. Лиценз: `THIRD_PARTY_NOTICES.md`.

## Route

| Route | Хуудас | Эзэмшигч |
|---|---|---|
| `/` | Нүүр: Hero, бидний тухай (танилцуулга, эрхэм зорилго, алсын хараа, үнэт зүйлс), манай баг (CV), үйлчилгээний диаграмм, үйлчилгээний тойм, FAQ, CTA | ABAY-1 |
| `/services` | 3 үйлчилгээний тойм + нийт урсгал | ABAY-2 |
| `/services/[slug]` | `training` · `laboratory` · `update` — Тойм: тайлбар, үр өгөөж, процесс, дараагийн алхам | ABAY-2 |
| `/services/[slug]/{programs,trainers,pricing,report,faq}` | Дэд хуудас бүр нэг мэдээлэл: хөтөлбөр, сургагч багш (CV), үнийн санал, тайлангийн загвар (A4, хэвлэх), FAQ. Хөтөлбөр/багшгүй үйлчилгээнд тэр tab байхгүй | ABAY-2 |
| `/contact` | Хүсэлтийн маягт (`?service=&package=` урьдчилж бөглөнө) + Google Calendar-ын сул цагаас уулзалт захиалах (`docs/BOOKING.md`) | ABAY-3 |
| `/api/booking/availability` | Сул цагийн JSON (`?duration=30\|60`), cache-гүй | ABAY-3 |

## Хавтасны бүтэц

```
src/
├─ app/                  route-ууд (дээрх хүснэгт), layout.tsx, globals.css
├─ components/
│  ├─ ui/                shadcn primitives — `npx shadcn@latest add <нэр>` (coordinator)
│  ├─ shared/            SectionHeading, PageHeader, CtaBanner, FaqAccordion (coordinator)
│  ├─ layout/            Navbar, Footer, Logo, ModeToggle (ABAY-1)
│  ├─ home/              нүүрний section-ууд (ABAY-1)
│  ├─ services/          үйлчилгээний component-ууд (ABAY-2)
│  └─ contact/           маягт, холбоо барих мэдээлэл (ABAY-3)
├─ content/              бүх текст, үнэ, алхам — typed data (монгол)
├─ lib/                  utils (cn), format (formatMNT), theme, brand (лого asset), request-schema, request, booking/ (уулзалтын цаг)
└─ types/content.ts      агуулгын гэрээ (contract)
```

## Агуулгын урсгал

- Бүх текст, үнэ, алхам `src/content/*.ts`-д байна; component-ууд түүнийг import хийнэ. Component дотор текст hard-code хийхгүй (товчны богино шошгоос бусад).
- Төрлүүд `src/types/content.ts`-д: `Service`, `ProcessStep`, `Program`, `PricePackage`, `FlowStage`, `ReportTemplate`, `FaqItem`, `Company`, `NavItem`, `Stat`.
- Үнэ бүгд **түр утга** (`// TODO: бодит үнэ`). `price: null` → "Тохиролцоно". Харуулахдаа `formatMNT()` (`src/lib/format.ts`).
- Туслах функц: `getService(slug)`, `getNextService(slug)` (`src/content/services.ts`), `flowStages` (`src/content/process.ts`).

## Дизайн

- Брэнд өнгө: логоны нил ягаан `#441E82` = `--primary` (light). Dark горимд `oklch(0.72 0.14 294)`. Лого: `BrandLogo` (`components/layout/logo.tsx`) нь CSS mask тул light горимд primary, dark горимд цагаан. Өнгө hard-code хийхгүй — `bg-primary`, `text-muted-foreground` гэх мэт token class ашиглана.
- Фонт: Inter (`font-sans`, үндсэн текст), Montserrat (`font-heading`, h1–h4 автоматаар). Хоёулаа `cyrillic-ext` subset-тэй тул Ө, Ү зөв харагдана.
- Хуудасны өргөн: `container` utility (max 1280px, 16/24/32px padding).
- Section-ийн хэмнэл: `py-20 md:py-28`. Гарчиг: `SectionHeading` (`highlight` хэсэг нь primary gradient).
- Theme: `.dark` class, `src/lib/theme.ts` (`<head>` script → flash гарахгүй), `ModeToggle`. `next-themes` ашиглахгүй.
- Responsive: 375 / 768 / 1280 px дээр шалгана, хэвтээ scroll байх ёсгүй.

## Next.js 16 / Cache Components анхааруулга

- `next dev`/`next build` нь `AGENTS.md`-д Next-ийн блокийг нэмдэг — commit-д оруулна.
- Шинэ API-г `node_modules/next/dist/docs/` доторх баримтаас шалгана.
- Prerender үед `new Date()`, `Math.random()` шууд ашиглахгүй — `"use cache"`, client component эсвэл `connection()`.
- `searchParams` / `useSearchParams()` нь runtime өгөгдөл → `<Suspense fallback>` дотор байх ёстой (`/contact`).
- `dynamicParams`, `dynamic`, `revalidate` segment config ажиллахгүй. Тодорхойгүй slug → `notFound()`.
- `PageProps<"/route">`, `LayoutProps<"/">` нь global төрөл (`next typegen` үүсгэнэ).

## Маягт ба уулзалтын цаг

`submitRequest()` (`src/lib/request.ts`) нь хүсэлт илгээх цорын ганц цэг.
- **Уулзалтын цаг сонгосон:** Server Action `createBooking()` (`src/lib/booking/actions.ts`) сервер дээр дахин шалгаж Google Calendar-т уулзалт үүсгэнэ (`booked` / `slot-taken`).
- **Цаггүй хүсэлт:** backend холбогдох хүртэл `{ status: "mailto", href }` буцаана. UI "илгээгдлээ" гэж **худал мэдэгдэхгүй**, бөглөсөн мэдээллээр имэйл программыг нээнэ.
- Google-ийн тохиргоо, горимууд (Google / туршилтын / тохиргоогүй): `docs/BOOKING.md`.
