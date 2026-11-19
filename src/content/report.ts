import type { ReportTemplate, ServiceSlug } from "@/types/content"

// Тайлангийн жишээ загвар — бодит харилцагчийн мэдээлэл биш
const commonSections = {
  summary: {
    id: "summary",
    title: "1. Ерөнхий дүгнэлт",
    description: "Үйлчилгээний зорилго, хамрах хүрээ, гол үр дүнгийн товчлол.",
  },
  next: {
    id: "next-steps",
    title: "5. Дараагийн алхам",
    description: "Хэрэгжүүлэх хугацаа, хариуцагч, хяналтын төлөвлөгөө.",
  },
}

export const reportTemplates: ReportTemplate[] = [
  {
    service: "training",
    title: "Сургалтын үр дүнгийн тайлан",
    subtitle: "Business Training Service",
    metrics: [
      { label: "Мэдлэгийн ахиц", value: "+38%", score: 76 },
      { label: "Ирц", value: "96%", score: 96 },
      { label: "Сэтгэл ханамж", value: "4.7 / 5", score: 94 },
    ],
    sections: [
      commonSections.summary,
      {
        id: "participants",
        title: "2. Оролцогчдын бүрэлдэхүүн",
        description: "Хэлтэс, албан тушаалаар задалсан оролцоо, ирц.",
      },
      {
        id: "results",
        title: "3. Үнэлгээний үр дүн",
        description: "Сургалтын өмнөх болон дараах тестийн харьцуулалт.",
        items: ["Модуль тус бүрийн оноо", "Хамгийн их ахицтай сэдвүүд", "Нэмэлт анхаарах сэдвүүд"],
      },
      {
        id: "recommendations",
        title: "4. Зөвлөмж",
        description: "Мэдлэгийг ажил дээр хэрэгжүүлэх, дараагийн сургалтын санал.",
      },
      commonSections.next,
    ],
  },
  {
    service: "laboratory",
    title: "Business Laboratory тайлан",
    subtitle: "Business Laboratory Service",
    metrics: [
      { label: "Процессын үр ашиг", value: "62 / 100", score: 62 },
      { label: "Санхүүгийн эрүүл байдал", value: "71 / 100", score: 71 },
      { label: "Харилцагчийн сэтгэл ханамж", value: "68 / 100", score: 68 },
    ],
    sections: [
      commonSections.summary,
      {
        id: "current-state",
        title: "2. Одоогийн байдлын шинжилгээ",
        description: "Процесс, санхүү, зах зээлийн үзүүлэлтүүд.",
        items: ["Процессын зураглал", "Санхүүгийн харьцаа", "Өрсөлдөгчийн харьцуулалт"],
      },
      {
        id: "findings",
        title: "3. Гол асуудал ба боломж",
        description: "Илэрсэн асуудлууд, тэдгээрийн нөлөө, өсөлтийн боломж.",
      },
      {
        id: "recommendations",
        title: "4. Зөвлөмж",
        description: "Тэргүүлэх ач холбогдлоор эрэмбэлсэн сайжруулалтын арга хэмжээ.",
      },
      commonSections.next,
    ],
  },
  {
    service: "update",
    title: "Шинэчлэлийн үр дүнгийн тайлан",
    subtitle: "Business Update Service",
    metrics: [
      { label: "Процессын хугацаа", value: "−27%", score: 73 },
      { label: "Алдааны түвшин", value: "−41%", score: 82 },
      { label: "Хэрэгжилтийн явц", value: "90%", score: 90 },
    ],
    sections: [
      commonSections.summary,
      {
        id: "changes",
        title: "2. Хэрэгжүүлсэн өөрчлөлтүүд",
        description: "Шинэчилсэн процесс, бүтэц, журмын жагсаалт.",
      },
      {
        id: "kpi",
        title: "3. Гүйцэтгэлийн үзүүлэлт",
        description: "Өмнөх болон дараах үзүүлэлтийн харьцуулалт.",
        items: ["Хугацаа", "Зардал", "Чанар", "Харилцагчийн сэтгэл ханамж"],
      },
      {
        id: "sustain",
        title: "4. Тогтвортой байдал",
        description: "Өөрчлөлтийг тогтвортой байлгах хяналтын механизм.",
      },
      commonSections.next,
    ],
  },
]

export function getReportTemplate(slug: ServiceSlug): ReportTemplate | undefined {
  return reportTemplates.find((template) => template.service === slug)
}

/** `/services/[slug]/report` хуудасны текст. */
export const reportPageContent = {
  description:
    "Үйлчилгээний төгсгөлд хүлээлгэн өгөх албан ёсны тайлангийн бүтэц. Доорх нь жишээ загвар бөгөөд бодит тайлан танай байгууллагын өгөгдлөөр бэлтгэгдэнэ.",
  printLabel: "Хэвлэх / PDF болгох",
  printHint: "Хэвлэх цонхонд «PDF болгож хадгалах»-ыг сонговол PDF файл үүснэ.",
  paper: {
    watermark: "ЖИШЭЭ",
    clientLabel: "Харилцагч",
    clientValue: "[Байгууллагын нэр]",
    dateLabel: "Огноо",
    dateValue: "20XX.XX.XX",
    reportNoLabel: "Тайлангийн дугаар",
    reportNoValue: "AM-20XX-000",
    metricsTitle: "Гол үзүүлэлтүүд",
    footer: "Энэхүү баримт нь жишээ загвар бөгөөд бодит харилцагчийн мэдээлэл агуулаагүй болно.",
    page: "Хуудас 1",
  },
}
