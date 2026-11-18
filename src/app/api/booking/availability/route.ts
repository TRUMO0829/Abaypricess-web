import { connection } from "next/server"

import { getAvailability, getCalendarProvider, type AvailabilityResponse } from "@/lib/booking/availability"

// Сул цаг байнга өөрчлөгддөг тул prerender/cache хийхгүй — хүсэлт бүрт Google-оос шинээр асууна
export async function GET() {
  await connection()

  const provider = getCalendarProvider()
  if (!provider) return Response.json({ error: "unavailable" }, { status: 503 })

  try {
    const body: AvailabilityResponse = { mode: provider.kind, days: await getAvailability(provider) }
    return Response.json(body, { headers: { "cache-control": "no-store" } })
  } catch (error) {
    console.error("[booking] availability", error)
    return Response.json({ error: "calendar" }, { status: 502 })
  }
}
