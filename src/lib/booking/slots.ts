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

export interface AvailableSlot {
  /** Уулзалт эхлэх цаг, "2026-11-20T10:00:00+08:00" */
  start: string
  /** Энэ цагаас хамгийн удаан хэдэн минутын уулзалт багтах вэ (min…max, step-ээр) */
  maxMinutes: number
}

export interface AvailabilityDay {
  /** Орон нутгийн огноо, "2026-11-20" */
  date: string
  /** 0 = Ням … 6 = Бямба */
  weekday: number
  slots: AvailableSlot[]
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
  /** Уулзалтын хамгийн бага / их үргэлжлэх хугацаа, дуусах цагийн алхам (ж: 30, 60, 15) */
  minMinutes: number
  maxMinutes: number
  stepMinutes: number
  /** Завгүй цаг дууссаны дараа авах зай. Завгүй цагийн өмнө зай авахгүй (уулзалт шууд залгаж болно). */
  bufferAfterMinutes: number
  config: ScheduleConfig
}

/**
 * Ажлын өдөр бүрийн эхлэх цагууд ба тэр цагаас багтах хамгийн урт уулзалт.
 * Нөхцөл: ажлын цагт багтана, хангалттай эрт, завгүй цаг (+ дараах зай)-тай давхцахгүй, `minMinutes`-ээс богиноггүй.
 */
export function computeAvailability({
  now,
  busy,
  minMinutes,
  maxMinutes,
  stepMinutes,
  bufferAfterMinutes,
  config,
}: ComputeOptions): AvailabilityDay[] {
  const offset = config.utcOffsetMinutes * MINUTE
  const earliest = now + config.minNoticeMinutes * MINUTE
  const days: AvailabilityDay[] = []

  for (let i = 0; i < config.horizonDays; i++) {
    const midnight = localMidnight(now, config, i)
    const day = new Date(midnight)
    const weekday = day.getUTCDay()
    if (!config.workdays.includes(weekday)) continue

    const dayEnd = midnight + config.dayEndMinutes * MINUTE - offset
    const slots: AvailableSlot[] = []
    for (let t = config.dayStartMinutes; t + minMinutes <= config.dayEndMinutes; t += config.slotStepMinutes) {
      const start = midnight + t * MINUTE - offset
      if (start < earliest) continue

      // Эхлэх цаг завгүй цаг эсвэл түүний дараах зайд орвол болохгүй; дараагийн завгүй цаг хүртэл сул
      let limit = Math.min(dayEnd, start + maxMinutes * MINUTE)
      let blocked = false
      for (const b of busy) {
        if (b.start <= start && b.end + bufferAfterMinutes * MINUTE > start) {
          blocked = true
          break
        }
        if (b.start > start && b.start < limit) limit = b.start
      }
      const free = (limit - start) / MINUTE
      if (blocked || free < minMinutes) continue

      slots.push({
        start: toLocalIso(start, config.utcOffsetMinutes),
        maxMinutes: minMinutes + Math.floor((free - minMinutes) / stepMinutes) * stepMinutes,
      })
    }

    days.push({
      date: `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`,
      weekday,
      slots,
    })
  }

  return days
}
