import { createBooking, type BookingResult } from "@/lib/booking/actions"
import { buildMailto, type RequestContent } from "@/lib/request-summary"
import type { RequestInput } from "@/lib/request-schema"

export type SubmitResult = { status: "sent" } | BookingResult

/**
 * Хүсэлт илгээх цорын ганц цэг.
 * - Уулзалтын цаг сонгосон бол сервер дээр Google Calendar-т уулзалт үүсгэнэ (`booked` / `slot-taken`).
 *   Календарь зөвхөн унших горимд (API key) байвал цаг сул эсэхийг шалгаад сонгосон цагтай mailto буцаана.
 * - Цаггүй хүсэлтийг backend холбогдох хүртэл "илгээгдсэн" гэж үзэхгүй — бөглөсөн мэдээллээр mailto буцаана.
 */
export async function submitRequest(
  data: RequestInput,
  ctx: RequestContent,
  options: { honeypot?: string } = {}
): Promise<SubmitResult> {
  if (data.meetingStart) return createBooking(data, options.honeypot)
  try {
    return { status: "mailto", href: buildMailto(ctx, data) }
  } catch {
    return { status: "error", message: "Хүсэлтийг бэлтгэх үед алдаа гарлаа." }
  }
}

/**
 * Имэйл программыг mailto холбоосоор нээнэ (зөвхөн browser-т).
 * Түр `<a>` дээр click хийдэг тул e2e тест `HTMLAnchorElement.prototype.click`-ийг stub хийж
 * бодит программ нээлгүйгээр зөвхөн href-ийг шалгаж чадна.
 */
export function openMailClient(href: string): void {
  const link = document.createElement("a")
  link.href = href
  link.rel = "noopener"
  link.click()
}

export { buildMailto }
