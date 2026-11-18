/** Уулзалтын цаг захиалгын хуваарь. Google Calendar-ын сул цаг эдгээр дүрмээр шүүгдэнэ. */
export const bookingConfig = {
  timeZone: "Asia/Ulaanbaatar",
  /** Монгол Улс 2017 оноос зуны цаг хэрэглэдэггүй тул тогтмол UTC+8 */
  utcOffsetMinutes: 8 * 60,
  /** 0 = Ням … 6 = Бямба */
  workdays: [1, 2, 3, 4, 5],
  dayStartMinutes: 8 * 60,
  dayEndMinutes: 18 * 60,
  slotStepMinutes: 30,
  /** Хамгийн багадаа хэдэн минутын өмнө захиалах */
  minNoticeMinutes: 4 * 60,
  /** Өнөөдрөөс хойш хэдэн хоногийн цагийг харуулах */
  horizonDays: 14,
  /** Уулзалтын үргэлжлэх хугацаа ба бусад уулзалтаас хэдэн минут зай авах */
  durations: {
    "30": { minutes: 30, bufferMinutes: 15 },
    "60": { minutes: 60, bufferMinutes: 30 },
  },
}

export const meetingDurationValues = ["30", "60"] as const
export const meetingModeValues = ["online", "office"] as const
export type MeetingDuration = (typeof meetingDurationValues)[number]
export type MeetingMode = (typeof meetingModeValues)[number]

export const bookingContent = {
  title: "Уулзалтын цаг",
  optional: "(заавал биш)",
  description: "Google Calendar-аас шууд шинэчлэгдэх сул цагууд. Цаг сонговол урилга таны имэйлд очно.",
  durationLabel: "Үргэлжлэх хугацаа",
  durations: { "30": "30 минут", "60": "1 цаг" } satisfies Record<MeetingDuration, string>,
  modeLabel: "Уулзалтын хэлбэр",
  modes: { online: "Онлайн (Google Meet)", office: "Оффист" } satisfies Record<MeetingMode, string>,
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
  status: {
    booked: {
      title: "Уулзалтын цаг баталгаажлаа",
      description: "Хүсэлт тань хүлээн авлаа. Уулзалтын урилга таны имэйл рүү илгээгдсэн.",
      meet: "Google Meet холбоос урилгад орсон байгаа.",
      meetLink: "Google Meet холбоос",
      office: "Уулзалт манай оффист болно:",
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
