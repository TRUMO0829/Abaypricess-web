import { team } from "@/content/team"

/** Уулзалтын цаг захиалгын хуваарь. Google Calendar-ын сул цаг эдгээр дүрмээр шүүгдэнэ. */
export const bookingConfig = {
  timeZone: "Asia/Ulaanbaatar",
  /** Монгол Улс 2017 оноос зуны цаг хэрэглэдэггүй тул тогтмол UTC+8 */
  utcOffsetMinutes: 8 * 60,
  /** 0 = Ням … 6 = Бямба */
  workdays: [1, 2, 3, 4, 5],
  dayStartMinutes: 8 * 60,
  dayEndMinutes: 18 * 60,
  /** Эхлэх цагийн алхам */
  slotStepMinutes: 30,
  /** Хамгийн багадаа хэдэн минутын өмнө захиалах */
  minNoticeMinutes: 4 * 60,
  /** Өнөөдрөөс хойш хэдэн хоногийн цагийг харуулах */
  horizonDays: 14,
  /** Уулзалт 30 минутаас 1 цаг; дуусах цагийг 15 минутын алхмаар сонгоно */
  minMeetingMinutes: 30,
  maxMeetingMinutes: 60,
  meetingStepMinutes: 15,
  /** Календарийн завгүй цаг дууссаны дараа авах зай. Завгүй цагийн өмнө зай авахгүй. */
  bufferAfterMinutes: 15,
}

/** min…max хооронд step-ээр — `minMeetingMinutes` гэх мэт өөрчлөгдвөл энд нэмнэ */
export const meetingDurationValues = ["30", "45", "60"] as const
/** «Уулзах хүн»-д сонгогдох багийн гишүүд (`src/content/team.ts`, id-тай) */
export const meetingHosts = team.filter((member): member is typeof member & { id: string } => Boolean(member.id))

export const meetingModeValues = ["visit", "office", "online"] as const
export type MeetingDuration = (typeof meetingDurationValues)[number]
export type MeetingMode = (typeof meetingModeValues)[number]

export const bookingContent = {
  title: "Уулзалтын цаг",
  durationLabel: "Дуусах цаг",
  durations: { "30": "30 минут", "45": "45 минут", "60": "1 цаг" } satisfies Record<MeetingDuration, string>,
  hostLabel: "Уулзах хүн",
  /** Сонгоогүй үед — байгууллага нэг календарьтай тул сул цаг адилхан */
  anyHost: "Аль ч зөвлөх",
  modeLabel: "Уулзах газар",
  modes: { visit: "Очиж уулзах", office: "Оффист урих", online: "Онлайн" } satisfies Record<MeetingMode, string>,
  /** «Очиж уулзах» үед харилцагчийн хаяг */
  addressLabel: "Уулзах хаяг",
  addressPlaceholder: "Ж: Сүхбаатар дүүрэг, Сентрал Тауэр, 5 давхар",
  dayLabel: "Өдөр",
  timeLabel: "Сул цаг",
  noSlots: "Энэ өдөр сул цаг алга. Өөр өдөр сонгоно уу.",
  noDays: "Ойрын хугацаанд сул цаг алга. Хүсэлтээ цаггүй илгээвэл бид холбогдоно.",
  loading: "Сул цагийг ачаалж байна…",
  loadError: "Цагийн хуваарийг ачаалж чадсангүй.",
  retry: "Дахин оролдох",
  unavailable: "Цаг захиалга түр ашиглах боломжгүй. Хүсэлтээ цаггүй илгээвэл бид холбогдоно.",
  selected: "Сонгосон цаг",
  clear: "Цаг сонгохгүй",
  slotLost: "Сонгосон цаг өөр хүнд захиалагдсан тул дахин сонгоно уу.",
  mockNotice: "Туршилтын горим: Google Calendar холбогдоогүй, жишээ цагууд харагдаж байна.",
  submitWithMeeting: "Цаг захиалж, хүсэлт илгээх",
  submitWithMeetingRequest: "Сонгосон цагтай хүсэлт илгээх",
  /** Имэйлийн биед: "Хүссэн уулзалтын цаг: Пүрэв, 11-р сарын 20, 10:00–11:00" */
  mailMeetingLabel: "Хүссэн уулзалтын цаг",
  status: {
    booked: {
      title: "Уулзалтын цаг баталгаажлаа",
      description: "Хүсэлт тань хүлээн авлаа. Уулзалтын урилга таны имэйл рүү илгээгдсэн.",
      meet: "Zoom холбоос урилгад орсон байгаа.",
      meetLink: "Zoom холбоосоор нэгдэх",
      office: "Уулзалт манай оффист болно:",
      visit: "Манай зөвлөх дараах хаягаар очиж уулзана:",
      again: "Шинэ хүсэлт илгээх",
    },
    slotTaken: {
      title: "Сонгосон цаг дөнгөж сая захиалагдсан байна",
      description: "Шинэчлэгдсэн цагуудаас өөр цаг сонгоод дахин илгээнэ үү.",
    },
  },
  weekdays: ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"],
  weekdaysShort: ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"],
}
