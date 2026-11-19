import { services } from "@/content/services"
import type { ServiceSlug } from "@/types/content"

export type RequestServiceOption = ServiceSlug | "other"

export const serviceOptions: { value: RequestServiceOption; label: string }[] = [
  ...services.map((service) => ({ value: service.slug, label: service.name })),
  { value: "other", label: "Бусад / зөвлөгөө авах" },
]

export const contactPage = {
  title: "Хүсэлт илгээх",
  description:
    "Маягтыг бөглөөд илгээнэ үү. Манай зөвлөх 1 ажлын өдрийн дотор тантай холбогдож, хэрэгцээг тань тодруулна.",
}

/** Хүсэлтийн маягтын шошго, placeholder, төлөвийн мессеж. */
export const requestFormContent = {
  title: "Хүсэлтийн маягт",
  requiredNote: "* тэмдэгтэй талбарыг заавал бөглөнө.",
  fields: {
    name: { label: "Нэр", placeholder: "Бат-Эрдэнэ" },
    organization: { label: "Байгууллага", placeholder: "Байгууллагын нэр" },
    position: { label: "Албан тушаал", placeholder: "Ж: Хүний нөөцийн менежер" },
    email: { label: "Имэйл", placeholder: "name@company.mn" },
    phone: { label: "Утас", placeholder: "9911 2233" },
    service: { label: "Үйлчилгээ", placeholder: "Үйлчилгээ сонгох" },
    packageId: {
      label: "Багц",
      placeholder: "Багц сонгох",
      disabledPlaceholder: "Эхлээд үйлчилгээгээ сонгоно уу",
      undecided: "Одоогоор шийдээгүй",
      description: "Заавал биш. Шийдээгүй бол зөвлөх тань тохирох багцыг санал болгоно.",
    },
    message: {
      label: "Нэмэлт мэдээлэл",
      placeholder: "Танай байгууллагын хэрэгцээ, хамрах ажилтны тоо, хүссэн хугацаа гэх мэт",
    },
  },
  optional: "(заавал биш)",
  submit: "Хүсэлт илгээх",
  submitting: "Илгээж байна…",
  invalidSummary: (count: number) => `Маягтад ${count} алдаа байна. Тэмдэглэсэн талбаруудыг засна уу.`,
  status: {
    sent: {
      title: "Хүсэлт тань хүлээн авлаа",
      description: "Манай зөвлөх 1 ажлын өдрийн дотор тантай холбогдоно. Баярлалаа!",
      again: "Шинэ хүсэлт илгээх",
    },
    mailto: {
      title: "Имэйл программ тань нээгдэж байна",
      description:
        "Бөглөсөн мэдээлэл бүхий имэйл бэлэн боллоо. Имэйл программаасаа «Илгээх» товчийг дарснаар хүсэлт тань бидэнд хүрнэ.",
      reopen: "Имэйлийг дахин нээх",
      fallback: "Имэйл нээгдэхгүй байвал доорх хаягаар шууд холбогдоно уу:",
    },
    error: {
      title: "Хүсэлт илгээхэд алдаа гарлаа",
      description: "Түр хүлээгээд дахин оролдоно уу, эсвэл доорх хаягаар шууд холбогдоно уу:",
    },
  },
}

/** Холбоо барих мэдээллийн хажуугийн хэсэг. */
export const contactInfoContent = {
  title: "Холбоо барих",
  labels: { phone: "Утас", email: "Имэйл", address: "Хаяг", hours: "Ажлын цаг" },
  stepsTitle: "Цаашид юу болох вэ",
  steps: [
    { title: "Хүсэлт илгээх", description: "Маягтаар хэрэгцээ, сонирхож буй үйлчилгээгээ илгээнэ." },
    { title: "1 ажлын өдөрт холбогдоно", description: "Зөвлөх тань утсаар холбогдож, хэрэгцээг тодруулна." },
    { title: "Үнийн санал", description: "Танай байгууллагад тохирсон үнийн саналыг хүргүүлнэ." },
  ],
}
