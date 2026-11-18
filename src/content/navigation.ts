import type { NavItem } from "@/types/content"

export const mainNav: NavItem[] = [
  { label: "Нүүр", href: "/" },
  {
    label: "Үйлчилгээ",
    href: "/services",
    children: [
      {
        label: "Бизнесийн сургалт",
        href: "/services/training",
        description: "Business Training Service",
      },
      {
        label: "Бизнес лаборатори",
        href: "/services/laboratory",
        description: "Business Laboratory Service",
      },
      {
        label: "Бизнесийн шинэчлэл",
        href: "/services/update",
        description: "Business Update Service",
      },
    ],
  },
  { label: "Асуулт хариулт", href: "/assessment" },
  { label: "Холбоо барих", href: "/contact" },
]

export const requestCta: NavItem = { label: "Хүсэлт илгээх", href: "/contact" }

/** Footer-ийн баганууд */
export const footerNav = {
  services: { title: "Үйлчилгээ", items: mainNav.find((item) => item.href === "/services")?.children ?? [] },
  company: {
    title: "Компани",
    items: [
      { label: "Бүх үйлчилгээ", href: "/services" },
      { label: "Байгууллагын үнэлгээ", href: "/assessment" },
      { label: "Хүсэлт илгээх", href: "/contact" },
    ] satisfies NavItem[],
  },
  contactTitle: "Холбоо барих",
  rights: "Бүх эрх хуулиар хамгаалагдсан.",
  scrollTop: "Дээш буцах",
}

export const notFoundContent = {
  code: "404",
  title: "Хуудас олдсонгүй",
  description: "Таны хайсан хуудас устсан, нэр нь өөрчлөгдсөн эсвэл түр ашиглах боломжгүй байна.",
  home: "Нүүр хуудас руу буцах",
  services: "Үйлчилгээ үзэх",
}

export const servicesMenuAll = "Бүх үйлчилгээ, нийт урсгал"
