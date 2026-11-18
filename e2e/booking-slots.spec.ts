import { expect, test } from "@playwright/test"

import { availabilityWindow, computeAvailability, toLocalIso, type ScheduleConfig } from "../src/lib/booking/slots"

// Хөтөчгүй цэвэр функцийн тест — нэг project дээр л ажиллуулна
test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop", "pure function"))

const config: ScheduleConfig = {
  utcOffsetMinutes: 480,
  workdays: [1, 2, 3, 4, 5],
  dayStartMinutes: 8 * 60,
  dayEndMinutes: 18 * 60,
  slotStepMinutes: 30,
  minNoticeMinutes: 4 * 60,
  horizonDays: 14,
}

/** Улаанбаатарын цагаар → epoch ms */
const ub = (iso: string) => Date.parse(`${iso}+08:00`)

// 2026-11-16 Даваа, 06:00 (UB)
const monday6am = ub("2026-11-16T06:00:00")

/** Уулзалт 30–60 минут, дуусах цаг 15 минутын алхамтай, завгүй цагийн дараа 15 минут зай */
const meeting = { minMinutes: 30, maxMinutes: 60, stepMinutes: 15, bufferAfterMinutes: 15 }
const compute = (now: number, busy: { start: number; end: number }[] = []) =>
  computeAvailability({ now, busy, ...meeting, config })
const day = (days: ReturnType<typeof compute>, date: string) => days.find((d) => d.date === date)!.slots
const maxAt = (slots: ReturnType<typeof day>, time: string) => slots.find((s) => s.start.slice(11, 16) === time)?.maxMinutes

test("ажлын цаг, алхам, амралтын өдөр", () => {
  const days = compute(monday6am)
  // 14 хоногт 10 ажлын өдөр, бямба/ням алгасна
  expect(days).toHaveLength(10)
  expect(days.every((d) => d.weekday >= 1 && d.weekday <= 5)).toBe(true)
  // Мягмар: 08:00–17:30 хооронд 30 минутын алхамтай 20 эхлэх цаг
  const tuesday = day(days, "2026-11-17")
  expect(tuesday).toHaveLength(20)
  expect(tuesday[0]).toEqual({ start: "2026-11-17T08:00:00+08:00", maxMinutes: 60 })
  // 17:00-оос 1 цаг багтана, 17:30-аас зөвхөн 30 минут (18:00-д ажлын цаг дуусна)
  expect(maxAt(tuesday, "17:00")).toBe(60)
  expect(tuesday.at(-1)).toEqual({ start: "2026-11-17T17:30:00+08:00", maxMinutes: 30 })
})

test("хамгийн багадаа 4 цагийн өмнө захиална", () => {
  const days = compute(monday6am)
  // 06:00 + 4 цаг = 10:00-аас өмнөх цаг өнөөдөр харагдахгүй
  expect(days[0].date).toBe("2026-11-16")
  expect(days[0].slots[0].start).toBe("2026-11-16T10:00:00+08:00")
})

test("завгүй цагийн өмнө зай авахгүй, дараа нь 15 минут зай авна", () => {
  const busy = [{ start: ub("2026-11-17T12:00:00"), end: ub("2026-11-17T13:00:00") }]
  const slots = day(compute(monday6am, busy), "2026-11-17")
  // 11:00–12:00 шууд залгана; 11:30-аас зөвхөн 30 минут багтана
  expect(maxAt(slots, "11:00")).toBe(60)
  expect(maxAt(slots, "11:30")).toBe(30)
  // 12:00, 12:30 завгүй; 13:00 нь дараах 15 минутын зайд орно; 13:30-аас чөлөөтэй
  expect(maxAt(slots, "12:00")).toBeUndefined()
  expect(maxAt(slots, "12:30")).toBeUndefined()
  expect(maxAt(slots, "13:00")).toBeUndefined()
  expect(maxAt(slots, "13:30")).toBe(60)
})

test("дуусах цаг 15 минутын алхмаар багтана", () => {
  const busy = [{ start: ub("2026-11-17T10:15:00"), end: ub("2026-11-17T11:00:00") }]
  const slots = day(compute(monday6am, busy), "2026-11-17")
  // 09:30-аас 10:15 хүртэл 45 минут; 09:00-аас 1 цаг (10:00-д дуусна) хүртэл
  expect(maxAt(slots, "09:30")).toBe(45)
  expect(maxAt(slots, "09:00")).toBe(60)
  // 10:00-аас 15 минут л үлдэх тул санал болгохгүй
  expect(maxAt(slots, "10:00")).toBeUndefined()
})

test("цагийн бүс: UB-ийн огноо, ISO", () => {
  // UTC 2026-11-16 20:00 = UB 2026-11-17 04:00 (Мягмар)
  const now = Date.parse("2026-11-16T20:00:00Z")
  const window = availabilityWindow(now, config)
  expect(toLocalIso(window.start, 480)).toBe("2026-11-17T00:00:00+08:00")
  expect(compute(now)[0].date).toBe("2026-11-17")
})
