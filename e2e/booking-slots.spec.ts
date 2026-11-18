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

test("ажлын цаг, алхам, амралтын өдөр", () => {
  const days = computeAvailability({ now: monday6am, busy: [], durationMinutes: 60, bufferMinutes: 30, config })
  // 14 хоногт 10 ажлын өдөр, бямба/ням алгасна
  expect(days).toHaveLength(10)
  expect(days.every((day) => day.weekday >= 1 && day.weekday <= 5)).toBe(true)
  // Мягмар гаригт 08:00-17:00 хооронд 30 минутын алхамтай 19 цаг (сүүлийнх 17:00–18:00)
  const tuesday = days.find((day) => day.date === "2026-11-17")!
  expect(tuesday.slots[0]).toBe("2026-11-17T08:00:00+08:00")
  expect(tuesday.slots.at(-1)).toBe("2026-11-17T17:00:00+08:00")
  expect(tuesday.slots).toHaveLength(19)
})

test("хамгийн багадаа 4 цагийн өмнө захиална", () => {
  const days = computeAvailability({ now: monday6am, busy: [], durationMinutes: 30, bufferMinutes: 15, config })
  // 06:00 + 4 цаг = 10:00-аас өмнөх цаг өнөөдөр харагдахгүй
  expect(days[0].date).toBe("2026-11-16")
  expect(days[0].slots[0]).toBe("2026-11-16T10:00:00+08:00")
})

test("завгүй цагийн өмнө, хойно buffer-ээр зай авна", () => {
  const busy = [{ start: ub("2026-11-17T12:00:00"), end: ub("2026-11-17T13:00:00") }]
  const slots60 = computeAvailability({ now: monday6am, busy, durationMinutes: 60, bufferMinutes: 30, config }).find(
    (day) => day.date === "2026-11-17"
  )!.slots
  // 60 минут + 30 минутын зай: 10:30 (11:30-д дуусна) болно, 11:00 болохгүй; 13:30-аас эхэлнэ
  expect(slots60).toContain("2026-11-17T10:30:00+08:00")
  expect(slots60).not.toContain("2026-11-17T11:00:00+08:00")
  expect(slots60).not.toContain("2026-11-17T13:00:00+08:00")
  expect(slots60).toContain("2026-11-17T13:30:00+08:00")

  const slots30 = computeAvailability({ now: monday6am, busy, durationMinutes: 30, bufferMinutes: 15, config }).find(
    (day) => day.date === "2026-11-17"
  )!.slots
  // 30 минут + 15 минутын зай: 11:00 (11:30-д дуусна) болно, 11:30 болохгүй
  expect(slots30).toContain("2026-11-17T11:00:00+08:00")
  expect(slots30).not.toContain("2026-11-17T11:30:00+08:00")
})

test("цагийн бүс: UB-ийн огноо, ISO", () => {
  // UTC 2026-11-16 20:00 = UB 2026-11-17 04:00 (Мягмар)
  const now = Date.parse("2026-11-16T20:00:00Z")
  const window = availabilityWindow(now, config)
  expect(toLocalIso(window.start, 480)).toBe("2026-11-17T00:00:00+08:00")
  const days = computeAvailability({ now, busy: [], durationMinutes: 60, bufferMinutes: 30, config })
  expect(days[0].date).toBe("2026-11-17")
})
