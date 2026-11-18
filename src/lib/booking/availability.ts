import "server-only"

import { bookingConfig, type MeetingDuration } from "@/content/booking"
import { getCalendarProvider, type CalendarProvider } from "@/lib/booking/calendar"
import { availabilityWindow, computeAvailability, type AvailabilityDay } from "@/lib/booking/slots"

export interface AvailabilityResponse {
  mode: CalendarProvider["kind"]
  duration: MeetingDuration
  days: AvailabilityDay[]
}

/** Тухайн үргэлжлэх хугацаатай уулзалтын сул цагууд (Google-оос тухай бүр шинээр асууна). */
export async function getAvailability(
  provider: CalendarProvider,
  duration: MeetingDuration,
  now = Date.now()
): Promise<AvailabilityDay[]> {
  const { minutes, bufferMinutes } = bookingConfig.durations[duration]
  const busy = await provider.busy(availabilityWindow(now, bookingConfig))
  return computeAvailability({ now, busy, durationMinutes: minutes, bufferMinutes, config: bookingConfig })
}

/** Захиалахын өмнө тухайн цаг одоо ч сул эсэхийг дахин шалгана (давхар захиалгаас хамгаална). */
export async function isSlotFree(provider: CalendarProvider, startIso: string, duration: MeetingDuration) {
  const days = await getAvailability(provider, duration)
  return days.some((day) => day.slots.includes(startIso))
}

export { getCalendarProvider }
