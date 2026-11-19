import type { NavItem } from "@/types/content"

export const mainNav: NavItem[] = [
  { label: "Нүүр", href: "/" },
  {
    label: "Үйлчилгээ",
    href: "/services",
    children: [
      {
        label: "Business Training Service",
        href: "/services/training",
      },
      {
        label: "Business Laboratory Service",
        href: "/services/laboratory",
      },
      {
        label: "Business Update Service",
        href: "/services/update",
      },
    ],
  },
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
      { label: "Үнэлгээний асуулт", href: "/assessment" },
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
