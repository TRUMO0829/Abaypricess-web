import type { NavItem } from "@/types/content"

export const mainNav: NavItem[] = [
  { label: "Нүүр", href: "/" },
  { label: "Бидний тухай", href: "/about" },
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
  { label: "Тайлангийн загвар", href: "/report" },
  { label: "Холбоо барих", href: "/contact" },
]

export const requestCta: NavItem = { label: "Хүсэлт илгээх", href: "/contact" }
