import { serviceOptions } from "@/content/contact"
import { getService } from "@/content/services"
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
    `Овог нэр: ${data.name}`,
    `Байгууллага: ${data.organization}`,
    data.position ? `Албан тушаал: ${data.position}` : null,
    `Имэйл: ${data.email}`,
    `Утас: ${data.phone}`,
    `Үйлчилгээ: ${getServiceLabel(data.service)}`,
    packageName ? `Багц: ${packageName}` : null,
    data.message ? `\nНэмэлт мэдээлэл:\n${data.message}` : null,
  ].filter((line): line is string => line !== null)
}
