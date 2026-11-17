# Адапт Менежмент ХХК — албан ёсны вебсайт

Бизнесийн сургалт, бизнес лаборатори, бизнесийн шинэчлэлийн үйлчилгээг танилцуулах вебсайт.
Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui.

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + build
npm run test:e2e   # Playwright smoke/e2e (систем дээрх Chrome ашиглана)
```

- Архитектур, route, дизайн: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Агентуудын ажлын дүрэм: [AGENTS.md](AGENTS.md)
- Эх материал (brief, процесс диаграмм, лого): [docs/brief/](docs/brief/)
- Агуулга, үнэ засах: `src/content/*.ts` (үнэ одоогоор түр утга)
