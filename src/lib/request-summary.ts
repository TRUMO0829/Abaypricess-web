import type { bookingContent } from "@/content/booking"
import { formatMeeting } from "@/lib/booking/format"
import type { RequestInput } from "@/lib/request-schema"
import type { ContactInfo, Service, ServiceSlug, TeamMember } from "@/types/content"

/**
 * Хүсэлтийн маягт, имэйл, календарийн тайлбарт хэрэгтэй текст (админы засвар орсон, client руу дамжих боломжтой).
 * Server дээр `toRequestContent(await getSiteContent())`-оор бүрдүүлнэ.
 */
export interface RequestContent {
  text: RequestFormTexts
  booking: typeof bookingContent
  contact: ContactInfo
  serviceOptions: { value: ServiceSlug | "other"; label: string }[]
  services: { slug: ServiceSlug; name: string; packages: { id: string; name: string }[] }[]
  hosts: { id: string; name: string; role: string }[]
}

export type RequestFormTexts = typeof import("@/content/contact").requestFormContent

export function toRequestContent(content: {
  requestFormContent: RequestFormTexts
  bookingContent: typeof bookingContent
  company: { contact: ContactInfo }
  serviceOptions: RequestContent["serviceOptions"]
  services: Service[]
  meetingHosts: (TeamMember & { id: string })[]
}): RequestContent {
  return {
    text: content.requestFormContent,
    booking: content.bookingContent,
    contact: content.company.contact,
    serviceOptions: content.serviceOptions,
    services: content.services.map((service) => ({
      slug: service.slug,
      name: service.name,
      packages: service.packages.map((pkg) => ({ id: pkg.id, name: pkg.name })),
    })),
    hosts: content.meetingHosts.map((host) => ({ id: host.id, name: host.name, role: host.role })),
  }
}

/** Багцын id-г хүнд ойлгомжтой нэр болгоно: "standard" → "Стандарт". */
export function getPackageName(ctx: RequestContent, service: RequestInput["service"], packageId?: string): string | undefined {
  if (!packageId || service === "other") return undefined
  return ctx.services.find((s) => s.slug === service)?.packages.find((pkg) => pkg.id === packageId)?.name ?? packageId
}

export function getServiceLabel(ctx: RequestContent, service: RequestInput["service"]): string {
  return ctx.serviceOptions.find((o) => o.value === service)?.label ?? service
}

/** Хүсэлтийн мэдээллийг мөр мөрөөр (имэйлийн бие, календарийн тайлбарт). */
export function buildRequestLines(ctx: RequestContent, data: RequestInput): string[] {
  const packageName = getPackageName(ctx, data.service, data.packageId)
  return [
    `Нэр: ${data.name}`,
    `Байгууллага: ${data.organization}`,
    `Албан тушаал: ${data.position}`,
    `Имэйл: ${data.email}`,
    `Утас: ${data.phone}`,
    `Үйлчилгээ: ${getServiceLabel(ctx, data.service)}`,
    packageName ? `Багц: ${packageName}` : null,
    data.message ? `\nНэмэлт мэдээлэл:\n${data.message}` : null,
  ].filter((line): line is string => line !== null)
}

/** "Овог Нэр (Төслийн удирдагч)" эсвэл «Аль ч зөвлөх» */
export function getHostLabel(ctx: RequestContent, hostId?: string): string {
  const host = ctx.hosts.find((member) => member.id === hostId)
  return host ? `${host.name} (${host.role})` : ctx.booking.anyHost
}

/** Сонгосон уулзалтын цагийн мөрүүд (цаг сонгоогүй бол хоосон). */
export function buildMeetingLines(ctx: RequestContent, data: RequestInput): string[] {
  if (!data.meetingStart || !data.meetingDuration || !data.meetingMode) return []
  const minutes = Number(data.meetingDuration)
  const t = ctx.booking
  return [
    "",
    `${t.mailMeetingLabel}: ${formatMeeting(data.meetingStart, minutes)}`,
    `${t.hostLabel}: ${getHostLabel(ctx, data.meetingHost)}`,
    `${t.modeLabel}: ${t.modes[data.meetingMode]}${data.meetingMode === "online" ? " (Zoom)" : ""}`,
    ...(data.meetingMode === "visit" && data.meetingAddress ? [`${t.addressLabel}: ${data.meetingAddress}`] : []),
  ]
}

export function buildMailto(ctx: RequestContent, data: RequestInput): string {
  const subject = `${data.meetingStart ? "Уулзалтын хүсэлт" : "Үйлчилгээний хүсэлт"} — ${data.organization}`
  const body = [...buildRequestLines(ctx, data), ...buildMeetingLines(ctx, data)].join("\n")
  return `mailto:${ctx.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
