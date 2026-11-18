import "server-only"

import { bookingConfig } from "@/content/booking"
import { toLocalIso, type Interval } from "@/lib/booking/slots"

export interface NewEvent {
  start: number
  end: number
  summary: string
  description: string
  attendee: { email: string; name: string }
  mode: "online" | "office"
  location?: string
}

export interface CreatedEvent {
  id: string
  meetLink?: string
}

export interface CalendarProvider {
  kind: "google" | "mock"
  busy(range: Interval): Promise<Interval[]>
  createEvent(event: NewEvent): Promise<CreatedEvent>
}

const MINUTE = 60_000

/* ── Google Calendar (OAuth refresh token, REST API) ─────────────────────────── */

interface GoogleEnv {
  clientId: string
  clientSecret: string
  refreshToken: string
  calendarId: string
}

function googleEnv(): GoogleEnv | null {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID } = process.env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null
  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    refreshToken: GOOGLE_REFRESH_TOKEN,
    calendarId: GOOGLE_CALENDAR_ID || "primary",
  }
}

// Access token-ийг процессын туршид дахин ашиглана (≈1 цаг хүчинтэй)
const tokenCache = globalThis as typeof globalThis & { __adaptGoogleToken?: { value: string; expiresAt: number } }

async function accessToken(env: GoogleEnv): Promise<string> {
  const cached = tokenCache.__adaptGoogleToken
  if (cached && cached.expiresAt > Date.now() + MINUTE) return cached.value

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      refresh_token: env.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Google token: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache.__adaptGoogleToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 }
  return json.access_token
}

async function googleFetch<T>(env: GoogleEnv, path: string, body: unknown): Promise<T> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${await accessToken(env)}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Google Calendar ${path}: ${res.status} ${await res.text()}`)
  return (await res.json()) as T
}

function googleProvider(env: GoogleEnv): CalendarProvider {
  return {
    kind: "google",
    async busy(range) {
      const json = await googleFetch<{
        calendars: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>
      }>(env, "/freeBusy", {
        timeMin: new Date(range.start).toISOString(),
        timeMax: new Date(range.end).toISOString(),
        items: [{ id: env.calendarId }],
      })
      const calendar = json.calendars[env.calendarId] ?? Object.values(json.calendars)[0]
      if (!calendar || calendar.errors?.length) throw new Error(`Google freeBusy: ${JSON.stringify(calendar?.errors)}`)
      return (calendar.busy ?? []).map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }))
    },
    async createEvent(event) {
      const { timeZone, utcOffsetMinutes } = bookingConfig
      const json = await googleFetch<{ id: string; hangoutLink?: string }>(
        env,
        `/calendars/${encodeURIComponent(env.calendarId)}/events?sendUpdates=all&conferenceDataVersion=1`,
        {
          summary: event.summary,
          description: event.description,
          start: { dateTime: toLocalIso(event.start, utcOffsetMinutes), timeZone },
          end: { dateTime: toLocalIso(event.end, utcOffsetMinutes), timeZone },
          attendees: [{ email: event.attendee.email, displayName: event.attendee.name }],
          location: event.location,
          conferenceData:
            event.mode === "online"
              ? { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } }
              : undefined,
        }
      )
      return { id: json.id, meetLink: json.hangoutLink }
    },
  }
}

/* ── Туршилтын календарь (dev, e2e) ─────────────────────────────────────────── */

// Route handler, Server Action өөр bundle-д байж болох тул нэг процессын globalThis-д хадгална
const mockStore = globalThis as typeof globalThis & { __adaptMockBookings?: Interval[] }

/** Ажлын өдөр бүр давтагдах жишээ завгүй цагууд (орон нутгийн цаг, минутаар). */
const mockBusyPattern: Record<number, [number, number][]> = {
  1: [[10 * 60, 11 * 60]],
  2: [[9 * 60, 10 * 60], [14 * 60, 15 * 60 + 30]],
  3: [[13 * 60, 14 * 60]],
  4: [[10 * 60, 12 * 60]],
  5: [[15 * 60, 17 * 60]],
}

const mockProvider: CalendarProvider = {
  kind: "mock",
  async busy(range) {
    const offset = bookingConfig.utcOffsetMinutes * MINUTE
    const busy: Interval[] = []
    for (let midnight = range.start + offset; midnight < range.end + offset; midnight += 24 * 60 * MINUTE) {
      const weekday = new Date(midnight).getUTCDay()
      for (const [from, to] of mockBusyPattern[weekday] ?? []) {
        busy.push({ start: midnight - offset + from * MINUTE, end: midnight - offset + to * MINUTE })
      }
    }
    return [...busy, ...(mockStore.__adaptMockBookings ?? [])]
  },
  async createEvent(event) {
    mockStore.__adaptMockBookings ??= []
    mockStore.__adaptMockBookings.push({ start: event.start, end: event.end })
    return { id: `mock-${mockStore.__adaptMockBookings.length}` }
  },
}

/**
 * Google-ийн env бүрэн бол бодит календарь, үгүй бол dev/e2e-д (BOOKING_MOCK=1) туршилтын календарь.
 * Production-д тохиргоогүй бол `null` — цаг захиалга нуугдаж, маягт имэйлээр ажилласаар байна.
 */
export function getCalendarProvider(): CalendarProvider | null {
  const env = googleEnv()
  if (env) return googleProvider(env)
  if (process.env.BOOKING_MOCK === "1" || process.env.NODE_ENV === "development") return mockProvider
  return null
}

