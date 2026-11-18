import { bookingContent } from "@/content/booking"

const pad = (n: number) => String(n).padStart(2, "0")

/** "2026-11-20T10:00:00+08:00" → "10:00" (сервер бүсийн цагаар өгдөг тул хөтчийн бүсээс үл хамаарна). */
export function slotTime(iso: string): string {
  return iso.slice(11, 16)
}

/** "10:00" + 45 → "10:45" */
export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number)
  const total = h * 60 + m + minutes
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

/** "2026-11-20" → { weekday: 5, month: 11, day: 20 } */
function parseDate(date: string) {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number)
  return { weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay(), month: m, day: d }
}

/** "Пүрэв, 11-р сарын 20" */
export function formatDayLong(date: string): string {
  const { weekday, month, day } = parseDate(date)
  return `${bookingContent.weekdays[weekday]}, ${month}-р сарын ${day}`
}

/** "Пүрэв, 11-р сарын 20, 10:00–11:00" */
export function formatMeeting(startIso: string, minutes: number): string {
  const start = slotTime(startIso)
  return `${formatDayLong(startIso)}, ${start}–${addMinutes(start, minutes)}`
}
