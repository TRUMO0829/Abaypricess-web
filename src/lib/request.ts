import { company } from "@/content/company"
import { serviceOptions } from "@/content/contact"
import { getService } from "@/content/services"
import type { RequestInput } from "@/lib/request-schema"

export type SubmitResult =
  | { status: "sent" }
  | { status: "mailto"; href: string }
  | { status: "error"; message: string }

/**
 * Хүсэлт илгээх цорын ганц цэг. Backend (Server Action / Resend) холбогдох хүртэл
 * хүсэлтийг "илгээгдсэн" гэж үзэхгүй — бөглөсөн мэдээллээр mailto холбоос буцаана.
 * Backend холбогдоход зөвхөн энэ функцийг сольж `{ status: "sent" }` буцаана; UI бүх төлөвийг дэмжинэ.
 */
export async function submitRequest(data: RequestInput): Promise<SubmitResult> {
  try {
    return { status: "mailto", href: buildMailto(data) }
  } catch {
    return { status: "error", message: "Хүсэлтийг бэлтгэх үед алдаа гарлаа." }
  }
}

/** Багцын id-г хүнд ойлгомжтой нэр болгоно: "standard" → "Стандарт". */
export function getPackageName(service: RequestInput["service"], packageId?: string): string | undefined {
  if (!packageId || service === "other") return undefined
  return getService(service)?.packages.find((pkg) => pkg.id === packageId)?.name ?? packageId
}

export function buildMailto(data: RequestInput): string {
  const serviceLabel = serviceOptions.find((o) => o.value === data.service)?.label ?? data.service
  const packageName = getPackageName(data.service, data.packageId)
  const lines = [
    `Овог нэр: ${data.name}`,
    `Байгууллага: ${data.organization}`,
    data.position ? `Албан тушаал: ${data.position}` : null,
    `Имэйл: ${data.email}`,
    `Утас: ${data.phone}`,
    `Үйлчилгээ: ${serviceLabel}`,
    packageName ? `Багц: ${packageName}` : null,
    data.message ? `\nНэмэлт мэдээлэл:\n${data.message}` : null,
  ].filter(Boolean)
  const subject = `Үйлчилгээний хүсэлт — ${data.organization}`
  return `mailto:${company.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`
}
