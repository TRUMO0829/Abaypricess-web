import { company } from "@/content/company"
import { serviceOptions } from "@/content/contact"
import type { RequestInput } from "@/lib/request-schema"

export type SubmitResult =
  | { status: "sent" }
  | { status: "mailto"; href: string }
  | { status: "error"; message: string }

/**
 * Хүсэлт илгээх цорын ганц цэг. Backend (Server Action / Resend) холбогдох хүртэл
 * хүсэлтийг "илгээгдсэн" гэж үзэхгүй — бөглөсөн мэдээллээр mailto холбоос буцаана.
 */
export async function submitRequest(data: RequestInput): Promise<SubmitResult> {
  return { status: "mailto", href: buildMailto(data) }
}

export function buildMailto(data: RequestInput): string {
  const serviceLabel = serviceOptions.find((o) => o.value === data.service)?.label ?? data.service
  const lines = [
    `Овог нэр: ${data.name}`,
    `Байгууллага: ${data.organization}`,
    data.position ? `Албан тушаал: ${data.position}` : null,
    `Имэйл: ${data.email}`,
    `Утас: ${data.phone}`,
    `Үйлчилгээ: ${serviceLabel}`,
    data.packageId ? `Багц: ${data.packageId}` : null,
    data.message ? `\n${data.message}` : null,
  ].filter(Boolean)
  const subject = `Үйлчилгээний хүсэлт — ${data.organization}`
  return `mailto:${company.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`
}
