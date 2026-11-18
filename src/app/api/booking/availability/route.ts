import { connection, type NextRequest } from "next/server"

import { meetingDurationValues } from "@/content/booking"
import { getAvailability, getCalendarProvider, type AvailabilityResponse } from "@/lib/booking/availability"

// Сул цаг байнга өөрчлөгддөг тул prerender/cache хийхгүй — хүсэлт бүрт Google-оос шинээр асууна
export async function GET(request: NextRequest) {
  await connection()
  const duration = meetingDurationValues.find((value) => value === request.nextUrl.searchParams.get("duration"))
  if (!duration) return Response.json({ error: "duration" }, { status: 400 })

  const provider = getCalendarProvider()
  if (!provider) return Response.json({ error: "unavailable" }, { status: 503 })

  try {
    const body: AvailabilityResponse = { mode: provider.kind, duration, days: await getAvailability(provider, duration) }
    return Response.json(body, { headers: { "cache-control": "no-store" } })
  } catch (error) {
    console.error("[booking] availability", error)
    return Response.json({ error: "calendar" }, { status: 502 })
  }
}
