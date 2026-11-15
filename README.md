# Абая Прайсэс ХХК — албан ёсны вебсайт

Технологи: Next.js App Router, TypeScript, Tailwind CSS.

Одоогийн үе шат: суурь application болон нийтлэг UI/types үүссэн; 3 Codex session холбогдож, хэрэгжүүлэлт бэлтгэж байна. Dependency суулгалт болон суурийн шалгалт явагдаж байна.

- [Системийн архитектур ба хуудасны бүтэц](docs/ARCHITECTURE.md)
- [Агентуудын зохион байгуулалт](docs/COORDINATION.md)
- [Нийтлэг interface болон өгөгдлийн гэрээ](docs/CONTRACTS.md)
- [Дизайны чиглэл](docs/DESIGN.md)

Эх материал: `image.png` — процесс диаграмм; `logo.png` — компанийн лого; `.txt` — эх brief. Эдгээр файлыг хадгална. Одоогийн хэрэглэгчийн зааврын дагуу Codex session ашиглана.

Session нэр: `ABAY-01-UI`, `ABAY-02-SERVICES`, `ABAY-03-REQUESTS`. Үндсэн session нь coordinator байна.

Хөгжүүлэлт: `npm install`, `npm run dev`. Шалгах: `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`, `npm run test:e2e`.

`.env.example`-ийг `.env.local` болгон хуулж шаардлагатай утгуудыг тохируулна. Бодит domain болон хүсэлт дамжуулах provider тохиргоогүй үед preview ашиглаж болно; хэрэглэгчийн хүсэлтийг амжилттай илгээсэн гэж үзэхгүй.
# Abaypricess-web
