import type { ServiceSlug } from "@/types/content"

export type RequestServiceOption = ServiceSlug | "other"

export const serviceOptions: { value: RequestServiceOption; label: string }[] = [
  { value: "training", label: "Бизнесийн сургалт (Business Training)" },
  { value: "laboratory", label: "Бизнес лаборатори (Business Laboratory)" },
  { value: "update", label: "Бизнесийн шинэчлэл (Business Update)" },
  { value: "other", label: "Бусад / зөвлөгөө авах" },
]

export const contactPage = {
  title: "Хүсэлт илгээх",
  description:
    "Маягтыг бөглөөд илгээнэ үү. Манай зөвлөх 1 ажлын өдрийн дотор тантай холбогдож, хэрэгцээг тань тодруулна.",
}
