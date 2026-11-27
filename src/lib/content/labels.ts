/** Админы засварын маягтад түлхүүрийн оронд харуулах нэр. Байхгүй бол түлхүүр өөрөө харагдана. */
const KEY_LABELS: Record<string, string> = {
  // ерөнхий
  title: "Гарчиг",
  subtitle: "Дэд гарчиг",
  highlight: "Гарчгийн тодруулсан хэсэг",
  eyebrow: "Гарчгийн дээрх жижиг шошго",
  description: "Тайлбар",
  shortDescription: "Товч тайлбар",
  label: "Нэр / шошго",
  placeholder: "Жишээ текст (placeholder)",
  text: "Текст",
  hint: "Тайлбар",
  items: "Мөрүүд",
  intro: "Танилцуулга",
  summary: "Товч",
  details: "Дэлгэрэнгүй",
  note: "Тэмдэглэл",
  submit: "Илгээх товч",
  submitting: "Илгээж байх үеийн текст",
  again: "Дахин илгээх товч",
  // компани
  name: "Нэр",
  nameEn: "Англи нэр",
  legalName: "Албан ёсны нэр",
  tagline: "Уриа",
  mission: "Эрхэм зорилго",
  vision: "Алсын хараа",
  values: "Үнэт зүйлс",
  contact: "Холбоо барих",
  phone: "Утас",
  email: "Имэйл",
  address: "Хаяг",
  hours: "Ажлын цаг",
  // хүн
  role: "Албан тушаал",
  photo: "Зураг (холбоос, ж: /team/bat.jpg эсвэл https://…)",
  experience: "Ажлын туршлага",
  expertise: "Ур чадвар",
  team: "Багийн гишүүд",
  trainers: "Сургагч багш нар",
  // үйлчилгээ
  services: "Үйлчилгээнүүд",
  benefits: "Үр өгөөж",
  process: "Процессын алхмууд",
  programs: "Сургалтын хөтөлбөрүүд",
  packages: "Үнийн багцууд",
  deliverable: "Хүлээлгэн өгөх баримт",
  duration: "Хугацаа",
  format: "Хэлбэр",
  topics: "Сэдвүүд",
  price: "Үнэ (₮, хоосон бол «Тохиролцоно»)",
  priceSuffix: "Үнийн дагавар (ж: / сар)",
  features: "Багцад багтах зүйлс",
  popular: "«Хамгийн их сонгогддог» тэмдэгтэй",
  cta: "Товчны текст",
  // нүүр
  hero: "Hero",
  primaryCta: "Үндсэн товч",
  secondaryCta: "Хоёрдогч товч",
  video: "Танилцуулга бичлэг",
  url: "YouTube холбоос",
  brochure: "Танилцуулга PDF",
  meta: "Файлын мэдээлэл",
  missionLabel: "«Эрхэм зорилго» шошго",
  visionLabel: "«Алсын хараа» шошго",
  // бусад
  sections: "Бүлгүүд",
  questions: "Асуултууд",
  options: "Сонголтууд",
  minLabel: "Хамгийн бага утгын шошго",
  maxLabel: "Хамгийн их утгын шошго",
  metrics: "Үзүүлэлтүүд",
  value: "Утга",
  steps: "Алхмууд",
  status: "Төлөвийн мессеж",
  fields: "Маягтын талбарууд",
  buttons: "Товчнууд",
  children: "Дэд цэс",
  lane: "Баганын нэр",
  action: "Үйлдэл",
  document: "Баримт",
  updated: "Шинэчилсэн огноо",
}

export function keyLabel(key: string | number): string {
  if (typeof key === "number") return `${key + 1}`
  return KEY_LABELS[key] ?? key
}

/** Жагсаалтын мөрийн гарчиг: нэр, гарчиг, шошгоос эхнийх нь */
export function itemTitle(item: unknown, index: number): string {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const record = item as Record<string, unknown>
    for (const key of ["name", "title", "label", "lane", "text"]) {
      const value = record[key]
      if (typeof value === "string" && value.trim()) return value.length > 70 ? `${value.slice(0, 70)}…` : value
    }
  }
  return `#${index + 1}`
}
