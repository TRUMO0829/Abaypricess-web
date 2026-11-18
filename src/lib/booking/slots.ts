// Сул цаг тооцох цэвэр функцууд (сүлжээ, env-гүй) — e2e/booking-slots.spec.ts-ээр шалгагдана.

export interface Interval {
  /** epoch ms */
  start: number
  end: number
}

export interface ScheduleConfig {
  utcOffsetMinutes: number
  workdays: number[]
  dayStartMinutes: number
  dayEndMinutes: number
  slotStepMinutes: number
  minNoticeMinutes: number
  horizonDays: number
}

export interface AvailabilityDay {
  /** Орон нутгийн огноо, "2026-11-20" */
  date: string
  /** 0 = Ням … 6 = Бямба */
  weekday: number
  /** Сул цагийн эхлэл, "2026-11-20T10:00:00+08:00" */
  slots: string[]
}

const MINUTE = 60_000
const pad = (n: number) => String(n).padStart(2, "0")

/** epoch ms → тухайн цагийн бүсийн ISO ("2026-11-20T10:00:00+08:00"). */
export function toLocalIso(ms: number, utcOffsetMinutes: number): string {
  const d = new Date(ms + utcOffsetMinutes * MINUTE)
  const sign = utcOffsetMinutes >= 0 ? "+" : "-"
  const abs = Math.abs(utcOffsetMinutes)
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

/** Орон нутгийн өнөөдрийн 00:00-ийг UTC-ээр илэрхийлсэн утга (цагийн бүсийн шилжилтгүй). */
function localMidnight(now: number, config: ScheduleConfig, dayOffset = 0): number {
  const local = new Date(now + config.utcOffsetMinutes * MINUTE)
  return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + dayOffset)
}

/** Google-оос завгүй цаг асуух хугацаа: өнөөдрийн 00:00-ээс horizon дуустал. */
export function availabilityWindow(now: number, config: ScheduleConfig): Interval {
  const offset = config.utcOffsetMinutes * MINUTE
  return {
    start: localMidnight(now, config) - offset,
    end: localMidnight(now, config, config.horizonDays) - offset,
  }
}

interface ComputeOptions {
  now: number
  busy: Interval[]
  durationMinutes: number
  /** Завгүй цагийн өмнө, хойно авах зай */
  bufferMinutes: number
  config: ScheduleConfig
}

/** Ажлын өдөр бүрийн сул цагууд: ажлын цагт багтсан, хангалттай эрт, завгүй цагаас buffer-ээр зайтай. */
export function computeAvailability({ now, busy, durationMinutes, bufferMinutes, config }: ComputeOptions): AvailabilityDay[] {
  const offset = config.utcOffsetMinutes * MINUTE
  const earliest = now + config.minNoticeMinutes * MINUTE
  const days: AvailabilityDay[] = []

  for (let i = 0; i < config.horizonDays; i++) {
    const midnight = localMidnight(now, config, i)
    const day = new Date(midnight)
    const weekday = day.getUTCDay()
    if (!config.workdays.includes(weekday)) continue

    const slots: string[] = []
    for (let t = config.dayStartMinutes; t + durationMinutes <= config.dayEndMinutes; t += config.slotStepMinutes) {
      const start = midnight + t * MINUTE - offset
      const end = start + durationMinutes * MINUTE
      if (start < earliest) continue
      const guardStart = start - bufferMinutes * MINUTE
      const guardEnd = end + bufferMinutes * MINUTE
      if (busy.some((b) => b.start < guardEnd && b.end > guardStart)) continue
      slots.push(toLocalIso(start, config.utcOffsetMinutes))
    }

    days.push({
      date: `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`,
      weekday,
      slots,
    })
  }

  return days
}
