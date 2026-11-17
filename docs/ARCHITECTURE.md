# Архитектур

Адапт Менежмент ХХК (Adapt Management)-ийн албан ёсны вебсайт. Агуулга нь `docs/brief/process-diagram.png` диаграммыг дагана:
**Танилцуулга → Training → Laboratory → Update → Тайлан**. Эх brief: `docs/brief/brief.txt`.

> Брэндийн нэр 2026-11-15-нд захиалагчийн хүсэлтээр "Абая Прайсэс"-ээс "Adapt Management" болж өөрчлөгдсөн. `docs/brief/` дахь эх материал (brief, хуучин лого) хуучин нэртэйгээ үлдэнэ. Компанийн нэр зөвхөн `src/content/company.ts`-д, лого тэмдэг `src/lib/brand.ts`-д байна.

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
| `/` | Нүүр: Hero, танилцуулга, эрхэм зорилго, ProcessFlow (диаграмм), үйлчилгээний тойм, статистик, FAQ, CTA | ABAY-1 |
| `/about` | Байгууллагын танилцуулга, эрхэм зорилго, алсын хараа, үнэт зүйлс | ABAY-1 |
| `/services` | 3 үйлчилгээний тойм + нийт урсгал | ABAY-2 |
| `/services/[slug]` | `training` · `laboratory` · `update` — процесс, хөтөлбөр, үнийн санал, FAQ | ABAY-2 |
| `/report` | Тайлангийн загварын preview (A4, үйлчилгээ тус бүрийн tab, хэвлэх) | ABAY-3 |
| `/contact` | Хүсэлтийн маягт (`?service=&package=` урьдчилж бөглөнө) | ABAY-3 |

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
│  ├─ report/            тайлангийн preview (ABAY-3)
│  └─ contact/           маягт, холбоо барих мэдээлэл (ABAY-3)
├─ content/              бүх текст, үнэ, алхам — typed data (монгол)
├─ lib/                  utils (cn), format (formatMNT), theme, brand (лого тэмдэг), request-schema, request
└─ types/content.ts      агуулгын гэрээ (contract)
```

## Агуулгын урсгал

- Бүх текст, үнэ, алхам `src/content/*.ts`-д байна; component-ууд түүнийг import хийнэ. Component дотор текст hard-code хийхгүй (товчны богино шошгоос бусад).
- Төрлүүд `src/types/content.ts`-д: `Service`, `ProcessStep`, `Program`, `PricePackage`, `FlowStage`, `ReportTemplate`, `FaqItem`, `Company`, `NavItem`, `Stat`.
- Үнэ бүгд **түр утга** (`// TODO: бодит үнэ`). `price: null` → "Тохиролцоно". Харуулахдаа `formatMNT()` (`src/lib/format.ts`).
- Туслах функц: `getService(slug)`, `getNextService(slug)` (`src/content/services.ts`), `flowStages` (`src/content/process.ts`).

## Дизайн

- Брэнд өнгө: логоны royal blue `#003199` = `--primary` (light). Dark горимд `oklch(0.68 0.15 262.5)`. Өнгө hard-code хийхгүй — `bg-primary`, `text-muted-foreground` гэх мэт token class ашиглана.
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

## Маягт (одоогоор зөвхөн UI)

`submitRequest()` (`src/lib/request.ts`) нь хүсэлт илгээх цорын ганц цэг. Backend холбогдох хүртэл `{ status: "mailto", href }` буцаадаг. UI нь "илгээгдлээ" гэж **худал мэдэгдэхгүй**, харин бөглөсөн мэдээллээр имэйл программыг нээнэ. Дараа нь зөвхөн энэ функцийг Server Action / Resend-ээр солино.
