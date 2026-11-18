import { bookingContent } from "@/content/booking"
import { company } from "@/content/company"
import { serviceOptions } from "@/content/contact"
import { getService } from "@/content/services"
import { formatMeeting } from "@/lib/booking/format"
import type { RequestInput } from "@/lib/request-schema"

/** Багцын id-г хүнд ойлгомжтой нэр болгоно: "standard" → "Стандарт". */
export function getPackageName(service: RequestInput["service"], packageId?: string): string | undefined {
  if (!packageId || service === "other") return undefined
  return getService(service)?.packages.find((pkg) => pkg.id === packageId)?.name ?? packageId
}

export function getServiceLabel(service: RequestInput["service"]): string {
  return serviceOptions.find((o) => o.value === service)?.label ?? service
}

/** Хүсэлтийн мэдээллийг мөр мөрөөр (имэйлийн бие, календарийн тайлбарт). */
export function buildRequestLines(data: RequestInput): string[] {
  const packageName = getPackageName(data.service, data.packageId)
  return [
    `Нэр: ${data.name}`,
    `Байгууллага: ${data.organization}`,
    `Албан тушаал: ${data.position}`,
    `Имэйл: ${data.email}`,
    `Утас: ${data.phone}`,
    `Үйлчилгээ: ${getServiceLabel(data.service)}`,
    packageName ? `Багц: ${packageName}` : null,
    data.message ? `\nНэмэлт мэдээлэл:\n${data.message}` : null,
  ].filter((line): line is string => line !== null)
}

/** Сонгосон уулзалтын цагийн мөрүүд (цаг сонгоогүй бол хоосон). */
export function buildMeetingLines(data: RequestInput): string[] {
  if (!data.meetingStart || !data.meetingDuration || !data.meetingMode) return []
  const minutes = Number(data.meetingDuration)
  return [
    "",
    `${bookingContent.mailMeetingLabel}: ${formatMeeting(data.meetingStart, minutes)}`,
    `${bookingContent.modeLabel}: ${bookingContent.modes[data.meetingMode]}`,
    ...(data.meetingMode === "visit" && data.meetingAddress ? [`${bookingContent.addressLabel}: ${data.meetingAddress}`] : []),
  ]
}

export function buildMailto(data: RequestInput): string {
  const subject = `${data.meetingStart ? "Уулзалтын хүсэлт" : "Үйлчилгээний хүсэлт"} — ${data.organization}`
  const body = [...buildRequestLines(data), ...buildMeetingLines(data)].join("\n")
  return `mailto:${company.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
