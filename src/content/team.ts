import type { TeamMember } from "@/types/content"

/** Нүүр хуудасны багийн хэсгийн текст */
export const teamSection = {
  eyebrow: "Манай баг",
  title: "Туршлагатай",
  highlight: "зөвлөхүүд",
  description: "Үйлчилгээ бүрийг тухайн салбартаа олон жил ажилласан мэргэжилтнүүд хариуцан гүйцэтгэнэ.",
}

/** Хүний карт (баг, сургагч багш)-ын CV шошго */
export const cvLabels = {
  cv: "CV харах",
  experience: "Ажлын туршлага",
  expertise: "Ур чадвар",
  contact: "Холбоо барих",
  phone: "Утас",
  email: "Имэйл",
}

// TODO: бодит нэр, албан тушаал, зураг (public/team/), CV, утас, имэйлээр солих
export const team: TeamMember[] = [
  {
    id: "project-lead",
    name: "Овог Нэр",
    role: "Төслийн удирдагч",
    summary: "Байгууллагын стратеги, удирдлагын зөвлөгөөгөөр 15 гаруй жил ажилласан.",
    experience: ["Төслийн удирдагч — 20XX оноос", "Удирдлагын зөвлөх — 20XX–20XX"],
    expertise: ["Стратеги төлөвлөлт", "Байгууллагын хөгжил"],
    phone: "+976 0000 0000",
    email: "name@adaptmanagement.mn",
  },
  {
    id: "senior-consultant",
    name: "Овог Нэр",
    role: "Ахлах зөвлөх",
    summary: "Үйл ажиллагааны процессын оношилгоо, сайжруулалтын төслүүдийг удирдсан.",
    experience: ["Ахлах зөвлөх — 20XX оноос", "Процессын менежер — 20XX–20XX"],
    expertise: ["Бизнес процесс", "Lean, Six Sigma"],
    phone: "+976 0000 0000",
    email: "name@adaptmanagement.mn",
  },
  {
    id: "training-manager",
    name: "Овог Нэр",
    role: "Сургалтын менежер",
    summary: "Байгууллагын сургалтын хөтөлбөр боловсруулж, мянга гаруй ажилтныг сургасан.",
    experience: ["Сургалтын менежер — 20XX оноос", "Хүний нөөцийн мэргэжилтэн — 20XX–20XX"],
    expertise: ["Сургалтын хөтөлбөр", "Манлайлал, харилцаа"],
    phone: "+976 0000 0000",
    email: "name@adaptmanagement.mn",
  },
  {
    id: "business-analyst",
    name: "Овог Нэр",
    role: "Бизнес шинжээч",
    summary: "Санхүү, өгөгдлийн шинжилгээгээр шийдвэр гаргалтыг дэмждэг.",
    experience: ["Бизнес шинжээч — 20XX оноос", "Санхүүгийн шинжээч — 20XX–20XX"],
    expertise: ["Санхүүгийн шинжилгээ", "Тайлан, дашбоард"],
    phone: "+976 0000 0000",
    email: "name@adaptmanagement.mn",
  },
]
