"use client"

import { useEffect, useEffectEvent, useState, type ReactNode } from "react"
import { AlertCircle, CalendarClock, RotateCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type bookingContent,
  meetingDurationValues,
  meetingModeValues,
  type MeetingDuration,
  type MeetingMode,
} from "@/content/booking"
import type { AvailabilityResponse } from "@/lib/booking/availability"
import { addMinutes, formatDayLong, formatMeeting, slotTime } from "@/lib/booking/format"
import type { AvailableSlot } from "@/lib/booking/slots"
import { ANY_HOST } from "@/lib/request-schema"
import { cn } from "@/lib/utils"

/** Сул цагийг хэдэн секунд тутам дахин асуух (табыг дахин нээхэд мөн шинэчилнэ) */
const REFRESH_MS = 60_000

type LoadState =
  | { state: "loading" }
  | { state: "ready"; data: AvailabilityResponse }
  | { state: "error" }
  | { state: "unavailable" }

interface ChoiceProps {
  name: string
  value: string
  checked: boolean
  onSelect: () => void
  label?: string
  muted?: boolean
  disabled?: boolean
  className?: string
  children: ReactNode
}

/** Товч хэлбэртэй radio — гарын сумаар шилжинэ, дэлгэц уншигчид radio гэж уншигдана. */
function Choice({ name, value, checked, onSelect, label, muted, disabled, className, children }: ChoiceProps) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-center justify-center rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors",
        "hover:border-primary/50 has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground",
        "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        muted && "text-muted-foreground",
        disabled && "pointer-events-none opacity-40",
        className
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        disabled={disabled}
        aria-label={label}
        // Label-ийг бүтэн бүрхсэн тунгалаг input: дарах талбай том, дэлгэц уншигчид radio хэвээр
        className="absolute inset-0 cursor-pointer appearance-none rounded-lg opacity-0"
      />
      {children}
    </label>
  )
}

interface MeetingPickerProps {
  /** Админы засвар орсон текст */
  t: typeof bookingContent
  /** «Уулзах хүн» сонголт */
  hosts: { id: string; name: string; role: string }[]
  start: string
  duration: MeetingDuration
  mode: MeetingMode
  onStartChange: (value: string) => void
  onDurationChange: (value: MeetingDuration) => void
  onModeChange: (value: MeetingMode) => void
  /** Утга өөрчлөгдөхөд сул цагийг шууд дахин ачаална (ж: "цаг дүүрсэн" хариу ирэхэд) */
  refreshKey: number
  /** Календарьт уулзалт үүсгэж чадах эсэх (API key горимд `false` — цаг хүсэлтэд л орно) */
  onCanBookChange?: (canBook: boolean) => void
  /** Уулзах багийн гишүүний id ("any" = аль ч зөвлөх) */
  host: string
  onHostChange: (value: string) => void
  /** «Очиж уулзах» үеийн хаяг */
  address: string
  onAddressChange: (value: string) => void
  addressError?: string
}

export function MeetingPicker({
  t,
  hosts: meetingHosts,
  start,
  duration,
  mode,
  onStartChange,
  onDurationChange,
  onModeChange,
  refreshKey,
  onCanBookChange,
  host,
  onHostChange,
  address,
  onAddressChange,
  addressError,
}: MeetingPickerProps) {
  const [load, setLoad] = useState<LoadState>({ state: "loading" })
  const [selectedDate, setSelectedDate] = useState<string>()
  const [slotLost, setSlotLost] = useState(false)
  const [tick, setTick] = useState(0)

  /** Тухайн эхлэх цагаас багтах хугацаанд дуусах цагийг тааруулна (одоогийнх багтахгүй бол хамгийн уртыг). */
  function fitDuration(slot: AvailableSlot) {
    if (Number(duration) <= slot.maxMinutes) return
    const longest = meetingDurationValues.filter((value) => Number(value) <= slot.maxMinutes).at(-1)
    if (longest) onDurationChange(longest)
  }

  // Шинэ өгөгдөл ирэхэд сонгосон цаг алга болсон бол сонголтыг цуцална, богиноссон бол дуусах цагийг тааруулна
  const receive = useEffectEvent((next: LoadState) => {
    if (next.state === "ready" && start) {
      const slot = next.data.days.flatMap((day) => day.slots).find((s) => s.start === start)
      if (!slot) {
        onStartChange("")
        setSlotLost(true)
      } else fitDuration(slot)
    }
    if (next.state === "ready") onCanBookChange?.(next.data.mode !== "google-key")
    setLoad(next)
  })

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/booking/availability", { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        if (res.status === 503) return receive({ state: "unavailable" })
        if (!res.ok) return receive({ state: "error" })
        receive({ state: "ready", data: (await res.json()) as AvailabilityResponse })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error)
          receive({ state: "error" })
        }
      })
    return () => controller.abort()
  }, [refreshKey, tick])

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1)
    const onVisible = () => document.visibilityState === "visible" && refresh()
    const timer = window.setInterval(refresh, REFRESH_MS)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  const days = load.state === "ready" ? load.data.days : []
  const activeDay =
    days.find((day) => day.date === selectedDate) ?? days.find((day) => day.slots.length > 0) ?? days[0]
  const minutes = Number(duration)
  const selectedSlot = days.flatMap((day) => day.slots).find((slot) => slot.start === start)

  return (
    <fieldset className="flex min-w-0 flex-col gap-5 rounded-xl bg-muted/40 p-5 ring-1 ring-foreground/10">
      <legend className="sr-only">{t.title}</legend>
      <p className="flex items-center gap-2 font-semibold">
        <CalendarClock className="size-4 text-primary" aria-hidden />
        {t.title}
      </p>

      {load.state === "ready" && load.data.mode === "mock" && (
        <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">{t.mockNotice}</p>
      )}

      {meetingHosts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label id="meetingHost-label" className="text-sm font-medium">
            {t.hostLabel}
          </label>
          <Select value={host || ANY_HOST} onValueChange={onHostChange}>
            <SelectTrigger id="meetingHost" aria-labelledby="meetingHost-label" className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_HOST}>{t.anyHost}</SelectItem>
              {meetingHosts.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} · {member.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div role="radiogroup" aria-label={t.modeLabel} className="grid grid-cols-3 gap-2">
        {meetingModeValues.map((value) => (
          <Choice key={value} name="meeting-mode" value={value} checked={mode === value} onSelect={() => onModeChange(value)} className="px-1.5 text-center text-xs leading-tight sm:text-sm">
            {t.modes[value]}
          </Choice>
        ))}
      </div>

      {mode === "visit" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meetingAddress" className="text-sm font-medium">
            {t.addressLabel} <span aria-hidden>*</span>
          </label>
          <Input
            id="meetingAddress"
            autoComplete="street-address"
            placeholder={t.addressPlaceholder}
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            aria-invalid={!!addressError}
            aria-describedby={addressError ? "meetingAddress-error" : undefined}
            className="bg-background"
          />
          {addressError && (
            <p id="meetingAddress-error" className="text-sm text-destructive">
              {addressError}
            </p>
          )}
        </div>
      )}

      <div aria-live="polite" className="flex flex-col gap-4">
        {load.state === "loading" && (
          <div aria-label={t.loading} className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none">
            <div className="h-14 rounded-lg bg-muted" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-9 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        )}

        {load.state === "error" && (
          <div className="flex flex-col items-start gap-3 text-sm">
            <p className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {t.loadError}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => setTick((n) => n + 1)}>
              <RotateCw data-icon="inline-start" aria-hidden />
              {t.retry}
            </Button>
          </div>
        )}

        {load.state === "unavailable" && <p className="text-sm text-muted-foreground">{t.unavailable}</p>}

        {load.state === "ready" && !days.some((day) => day.slots.length > 0) && (
          <p className="text-sm text-muted-foreground">{t.noDays}</p>
        )}

        {load.state === "ready" && activeDay && days.some((day) => day.slots.length > 0) && (
          <>
            <div role="radiogroup" aria-label={t.dayLabel} className="-mx-1 flex [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] gap-2 overflow-x-auto px-1 pb-1">
              {days.map((day) => (
                <Choice
                  key={day.date}
                  name="meeting-day"
                  value={day.date}
                  checked={day.date === activeDay.date}
                  onSelect={() => setSelectedDate(day.date)}
                  label={formatDayLong(day.date)}
                  muted={day.slots.length === 0}
                  className="min-w-14 shrink-0 flex-col gap-0.5 px-2 py-2 leading-none"
                >
                  <span className="text-[0.7rem] font-normal opacity-80">{t.weekdaysShort[day.weekday]}</span>
                  <span className="font-heading text-base font-bold">{Number(day.date.slice(8, 10))}</span>
                </Choice>
              ))}
            </div>

            {activeDay.slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noSlots}</p>
            ) : (
              <div role="radiogroup" aria-label={`${t.timeLabel}: ${formatDayLong(activeDay.date)}`} className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                {activeDay.slots.map((slot) => (
                  <Choice
                    key={slot.start}
                    name="meeting-slot"
                    value={slot.start}
                    checked={start === slot.start}
                    onSelect={() => {
                      onStartChange(slot.start)
                      fitDuration(slot)
                      setSlotLost(false)
                    }}
                  >
                    {slotTime(slot.start)}
                  </Choice>
                ))}
              </div>
            )}

            {selectedSlot && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">{t.durationLabel}</p>
                <div role="radiogroup" aria-label={t.durationLabel} className="grid grid-cols-3 gap-2">
                  {meetingDurationValues.map((value) => {
                    const fits = Number(value) <= selectedSlot.maxMinutes
                    const end = addMinutes(slotTime(selectedSlot.start), Number(value))
                    return (
                      <Choice
                        key={value}
                        name="meeting-duration"
                        value={value}
                        checked={duration === value}
                        onSelect={() => onDurationChange(value)}
                        label={`${end} (${t.durations[value]})`}
                        disabled={!fits}
                        className="flex-col gap-0.5 px-2 leading-tight"
                      >
                        <span className="font-semibold">{end}</span>
                        <span className="text-[0.7rem] font-normal opacity-80">{t.durations[value]}</span>
                      </Choice>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {slotLost && !start && (
          <p role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {t.slotLost}
          </p>
        )}

        {start && (
          <div className="flex items-start justify-between gap-3 rounded-lg bg-primary/10 p-3 text-sm ring-1 ring-primary/20">
            <p>
              <span className="block text-xs text-muted-foreground">{t.selected}</span>
              <span className="font-medium">
                {formatMeeting(start, minutes)} · {t.modes[mode]}
                {host && host !== ANY_HOST && ` · ${meetingHosts.find((m) => m.id === host)?.name ?? ""}`}
              </span>
            </p>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={t.clear} onClick={() => onStartChange("")}>
              <X aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </fieldset>
  )
}
