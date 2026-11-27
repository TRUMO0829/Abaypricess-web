import type { ContentKey } from "@/lib/content/defaults"

/** Админы «Агуулга» цэсний хэсгүүд. Хэсэг бүр `site_content`-ийн нэг мөр болж хадгалагдана. */
export interface ContentSection {
  key: string
  title: string
  description: string
  fields: { key: ContentKey; title: string }[]
}

export const contentSections: ContentSection[] = [
  {
    key: "company",
    title: "Компани, холбоо барих",
    description: "Компанийн нэр, уриа, танилцуулга, эрхэм зорилго, үнэт зүйлс, утас, имэйл, хаяг, ажлын цаг.",
    fields: [{ key: "company", title: "Компанийн мэдээлэл" }],
  },
  {
    key: "home",
    title: "Нүүр хуудас",
    description: "Hero хэсэг, бидний тухай, танилцуулга бичлэгийн YouTube холбоос, PDF товч.",
    fields: [
      { key: "hero", title: "Hero (нүүрний эхний хэсэг)" },
      { key: "heroCards", title: "Hero картууд" },
      { key: "homeSections", title: "Бидний тухай" },
    ],
  },
  {
    key: "team",
    title: "Манай баг",
    description: "Нүүр хуудасны зөвлөхүүд: нэр, албан тушаал, зураг, CV, утас, имэйл.",
    fields: [
      { key: "teamSection", title: "Хэсгийн гарчиг" },
      { key: "team", title: "Багийн гишүүд" },
      { key: "cvLabels", title: "CV-ийн шошго" },
    ],
  },
  {
    key: "services",
    title: "Үйлчилгээ, сургагч багш",
    description: "3 үйлчилгээний тайлбар, үр өгөөж, процесс, хөтөлбөр, сургагч багш нар, үнийн багц.",
    fields: [{ key: "services", title: "Үйлчилгээнүүд" }],
  },
  {
    key: "service-pages",
    title: "Үйлчилгээний хуудсын текст",
    description: "/services болон үйлчилгээний дэд хуудсуудын гарчиг, тайлбар, цэсний нэр, урсгалын диаграмм.",
    fields: [
      { key: "servicesPageContent", title: "/services хуудас" },
      { key: "serviceDetailContent", title: "Үйлчилгээний дэд хуудсууд" },
      { key: "flowStages", title: "Урсгалын диаграмм" },
      { key: "flowLabels", title: "Диаграммын шошго" },
    ],
  },
  {
    key: "navigation",
    title: "Цэс, footer",
    description: "Толгойн цэс, footer-ийн гарчгууд, 404 хуудас.",
    fields: [
      { key: "mainNav", title: "Толгойн цэс" },
      { key: "requestCta", title: "«Хүсэлт илгээх» товч" },
      { key: "servicesMenuAll", title: "Үйлчилгээ цэсний доод холбоос" },
      { key: "footerNav", title: "Footer" },
      { key: "notFoundContent", title: "404 хуудас" },
    ],
  },
  {
    key: "contact",
    title: "Хүсэлтийн маягт",
    description: "/contact хуудас, маягтын шошго, төлөвийн мессеж, «Цаашид юу болох вэ» алхмууд.",
    fields: [
      { key: "contactPage", title: "Хуудасны гарчиг" },
      { key: "requestFormContent", title: "Маягт" },
      { key: "contactInfoContent", title: "Холбоо барих хэсэг" },
    ],
  },
  {
    key: "booking",
    title: "Уулзалтын цаг",
    description: "Уулзалт захиалгын шошго, мессежүүд.",
    fields: [{ key: "bookingContent", title: "Уулзалтын цаг" }],
  },
  {
    key: "assessment",
    title: "Үнэлгээний асуулт",
    description: "Асуулгын хуудасны текст, бүлэг, асуултын текст. Асуулт нэмэх, оноо өөрчлөх нь кодоор хийгдэнэ.",
    fields: [
      { key: "assessmentPage", title: "Хуудасны текст" },
      { key: "assessment", title: "Асуултууд" },
    ],
  },
  {
    key: "report",
    title: "Тайлангийн загвар",
    description: "Үйлчилгээ бүрийн тайлангийн жишээ загвар.",
    fields: [
      { key: "reportTemplates", title: "Тайлангууд" },
      { key: "reportPageContent", title: "Хуудасны текст" },
    ],
  },
  {
    key: "auth",
    title: "Нэвтрэх, бүртгүүлэх",
    description: "Харилцагчийн нэвтрэх, бүртгүүлэх хуудасны текст.",
    fields: [{ key: "authContent", title: "Нэвтрэлт" }],
  },
  {
    key: "privacy",
    title: "Нууцлалын бодлого",
    description: "/privacy хуудасны агуулга.",
    fields: [{ key: "privacyPolicy", title: "Нууцлалын бодлого" }],
  },
]

export function getContentSection(key: string): ContentSection | undefined {
  return contentSections.find((section) => section.key === key)
}
