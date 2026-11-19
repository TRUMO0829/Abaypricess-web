"use server"

import { headers } from "next/headers"

import { bookingContent } from "@/content/booking"
import { company } from "@/content/company"
import { getCalendarProvider, isSlotFree } from "@/lib/booking/availability"
import { buildMailto, buildMeetingLines, buildRequestLines, getHostLabel, getServiceLabel } from "@/lib/request-summary"
import { requestSchema } from "@/lib/request-schema"

export type BookingResult =
  | { status: "booked"; start: string; duration: number; mode: "online" | "office" | "visit"; address?: string; host?: string; joinLink?: string }
  | { status: "slot-taken"; message: string }
  /** Календарь зөвхөн унших горимд: сонгосон цагтай имэйлийг хэрэглэгч өөрөө илгээнэ */
  | { status: "mailto"; href: string }
  | { status: "error"; message: string }

const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 }
const rateStore = globalThis as typeof globalThis & { __adaptBookingRate?: Map<string, number[]> }

/** IP тус бүрээс 10 минутад 5-аас олон захиалга хүлээж авахгүй (процессын санах ойд). */
async function rateLimited(): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  rateStore.__adaptBookingRate ??= new Map()
  const recent = (rateStore.__adaptBookingRate.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  if (recent.length >= RATE_LIMIT.max) return true
  rateStore.__adaptBookingRate.set(ip, [...recent, now])
  return false
}

/**
 * Хүсэлтийг Google Calendar-т уулзалт болгон бүртгэнэ. Маягтын утгыг сервер дээр дахин шалгаж,
 * тухайн цаг одоо ч сул эсэхийг шалгасны дараа event үүсгэнэ (урилга харилцагчийн имэйлд очно).
 */
export async function createBooking(input: unknown, honeypot?: string): Promise<BookingResult> {
  const generic = "Уулзалтын цагийг бүртгэх үед алдаа гарлаа."
  // Бот бөглөдөг нуугдмал талбар
  if (honeypot) return { status: "error", message: generic }

  const parsed = requestSchema.safeParse(input)
  if (!parsed.success) return { status: "error", message: "Маягтын мэдээлэл буруу байна." }
  const data = parsed.data
  if (!data.meetingStart || !data.meetingDuration || !data.meetingMode) {
    return { status: "error", message: "Уулзалтын цагаа сонгоно уу." }
  }

  const provider = getCalendarProvider()
  if (!provider) return { status: "error", message: bookingContent.unavailable }

  // Бодит календарийг спамаас хамгаална (туршилтын календарьт e2e олон удаа захиалдаг тул хязгаарлахгүй)
  if (provider.kind === "google" && (await rateLimited())) {
    return { status: "error", message: "Хэт олон оролдлого хийгдлээ. Хэсэг хугацааны дараа дахин оролдоно уу." }
  }

  try {
    if (!(await isSlotFree(provider, data.meetingStart, data.meetingDuration))) {
      return { status: "slot-taken", message: bookingContent.status.slotTaken.description }
    }

    // API key горим: календарьт бичих эрхгүй тул сонгосон цагийг хүсэлтийн имэйлд оруулна
    if (!provider.createEvent) return { status: "mailto", href: buildMailto(data) }

    const minutes = Number(data.meetingDuration)
    const start = Date.parse(data.meetingStart)
    const event = await provider.createEvent({
      start,
      end: start + minutes * 60_000,
      summary: `Уулзалт: ${data.organization} — ${getServiceLabel(data.service)}${data.meetingHost ? ` · ${getHostLabel(data.meetingHost)}` : ""}`,
      description: [...buildRequestLines(data), ...buildMeetingLines(data)].join("\n"),
      attendee: { email: data.email, name: data.name },
      mode: data.meetingMode,
      location:
        data.meetingMode === "office"
          ? company.contact.address
          : data.meetingMode === "visit"
            ? data.meetingAddress
            : undefined,
    })

    return {
      status: "booked",
      start: data.meetingStart,
      duration: minutes,
      mode: data.meetingMode,
      address: data.meetingMode === "visit" ? data.meetingAddress : undefined,
      host: getHostLabel(data.meetingHost),
      joinLink: event.joinLink,
    }
  } catch (error) {
    console.error("[booking]", error)
    return { status: "error", message: generic }
  }
}
