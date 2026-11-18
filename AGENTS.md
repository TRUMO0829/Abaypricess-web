<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Adapt Management вебсайт — агентуудын дүрэм

Архитектур, route, дизайны дүрэм: `docs/ARCHITECTURE.md`. Эх brief: `docs/brief/`.

## Багийн бүтэц

| Session | Branch / worktree | Эзэмших файлууд |
|---|---|---|
| **abaya-pricing-website-setup** (coordinator) | `main` | `src/components/ui/`, `src/components/shared/`, `src/types/`, `src/lib/utils.ts`, `src/lib/format.ts`, `src/lib/theme.ts`, `src/lib/brand.ts`, `src/content/team.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `package.json`, `next.config.ts`, `docs/`, `AGENTS.md` |
| **ABAY-1** · Layout & Нүүр | `feat/ui` · `../Website-wt/ui` | `src/components/layout/`, `src/components/home/`, `src/app/page.tsx`, `src/app/not-found.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/icon.*`, `src/app/opengraph-image.*`, `src/content/{company,home,faq,navigation,process}.ts` |
| **ABAY-2** · Үйлчилгээ | `feat/services` · `../Website-wt/services` | `src/components/services/`, `src/app/services/`, `src/content/services.ts` |
| **ABAY-3** · Тайлан & Хүсэлт | `feat/report` · `../Website-wt/report` | `src/components/report/`, `src/content/report.ts`, `src/components/contact/`, `src/app/contact/`, `src/content/{contact,booking}.ts`, `src/lib/{request,request-schema,request-summary}.ts`, `src/lib/booking/`, `src/app/api/booking/`, `scripts/` |

## Дүрэм

1. **Зөвхөн өөрийн эзэмшлийн файлыг засна.** Бусдын файл, `types/`, `ui/`, `shared/`, `package.json`-д өөрчлөлт хэрэгтэй бол coordinator руу `SendMessage` (to: `abaya-pricing-website-setup`) илгээнэ: юу, яагаад, ямар interface.
2. Бусдын файлыг **уншиж, import хийж** болно (ж: ABAY-2 `flowStages`-ийг уншина).
3. Шинэ npm package суулгахгүй — coordinator-оос хүснэ. shadcn component хэрэгтэй бол мөн адил.
4. Өөрийн worktree дээр ажиллана (`main`-д шууд commit хийхгүй). Commit-ийг жижиг, утга бүхий байлгана.
5. Дуусгахаасаа өмнө `npm run check` (lint + typecheck + build) **ногоон** байх ёстой.
6. Дуусмагц эсвэл саад гарвал coordinator руу тайлан илгээнэ: branch, хийсэн зүйл, шалгасан команд, үлдсэн асуудал.

## Кодын хэв маяг

- Файлын нэр kebab-case (`process-stepper.tsx`), export нь named PascalCase (`export function ProcessStepper`). Default export зөвхөн `page.tsx`/`layout.tsx`-д.
- Semicolon-гүй, давхар хашилт (shadcn-ий хэв маяг). Import: `@/…` alias.
- Server Component үндсэн. `"use client"` зөвхөн интерактив хэсэгт (state, event), аль болох жижиг навч component-д.
- Текст `src/content/`-оос; өнгө token class-аар (`bg-primary`, `text-muted-foreground`); `cn()` нь `@/lib/utils`-ээс.
- Загвар repo-гийн component-ийг хуулахдаа: Vite/`<a>` → `next/link`, Tailwind v3 → v4 (`bg-gradient-to-*` → `bg-linear-to-*`, `container` utility бэлэн), `@radix-ui/react-icons` → `lucide-react`.
- Хүртээмж: semantic HTML, `aria-*`, focus-visible, зурагт `alt`.

## Ажиллуулах

```bash
git worktree add ../Website-wt/<нэр> -b feat/<нэр>   # main-аас
cd ../Website-wt/<нэр>
npm ci   # EACCES гарвал: npm ci --cache "$TMPDIR/abay-npm-cache"
npm run dev -- -p <порт>   # ABAY-1: 3001, ABAY-2: 3002, ABAY-3: 3003
npm run check
```
