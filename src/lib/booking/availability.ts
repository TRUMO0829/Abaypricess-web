import "server-only"

import { bookingConfig, type MeetingDuration } from "@/content/booking"
import { getCalendarProvider, type CalendarProvider } from "@/lib/booking/calendar"
import { availabilityWindow, computeAvailability, type AvailabilityDay } from "@/lib/booking/slots"

export interface AvailabilityResponse {
  mode: CalendarProvider["kind"]
  days: AvailabilityDay[]
}

/** Эхлэх цаг бүр ба тэр цагаас багтах хамгийн урт уулзалт (Google-оос тухай бүр шинээр асууна). */
export async function getAvailability(provider: CalendarProvider, now = Date.now()): Promise<AvailabilityDay[]> {
  const busy = await provider.busy(availabilityWindow(now, bookingConfig))
  return computeAvailability({
    now,
    busy,
    minMinutes: bookingConfig.minMeetingMinutes,
    maxMinutes: bookingConfig.maxMeetingMinutes,
    stepMinutes: bookingConfig.meetingStepMinutes,
    bufferAfterMinutes: bookingConfig.bufferAfterMinutes,
    config: bookingConfig,
  })
}

/** Захиалахын өмнө тухайн цаг, хугацаа одоо ч сул эсэхийг дахин шалгана (давхар захиалгаас хамгаална). */
export async function isSlotFree(provider: CalendarProvider, startIso: string, duration: MeetingDuration) {
  const days = await getAvailability(provider)
  return days.some((day) => day.slots.some((slot) => slot.start === startIso && slot.maxMinutes >= Number(duration)))
}

export { getCalendarProvider }
