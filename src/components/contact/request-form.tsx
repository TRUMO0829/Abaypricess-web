"use client"

import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CalendarCheck, CheckCircle2, Loader2, Mail, MapPin, Phone, Send, Video } from "lucide-react"
import { Controller, useForm, useWatch, type DefaultValues } from "react-hook-form"

import { MeetingPicker } from "@/components/contact/meeting-picker"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatMeeting } from "@/lib/booking/format"
import { fill } from "@/lib/format"
import { openMailClient, submitRequest, type SubmitResult } from "@/lib/request"
import {
  requestSchema,
  requestServiceValues,
  ANY_HOST,
  UNDECIDED_PACKAGE,
  type RequestFormValues,
  type RequestInput,
} from "@/lib/request-schema"
import type { RequestContent } from "@/lib/request-summary"

type ServiceValue = (typeof requestServiceValues)[number]

function parseService(value: string | null): ServiceValue | undefined {
  return requestServiceValues.find((option) => option === value)
}

function packagesFor(services: RequestContent["services"], service: ServiceValue | undefined) {
  return service && service !== "other" ? (services.find((s) => s.slug === service)?.packages ?? []) : []
}

/** Нэвтэрсэн хэрэглэгчийн бүртгэлийн мэдээлэл — маягтыг урьдчилж бөглөнө (засах боломжтой). */
export interface RequestPrefill {
  name: string
  organization: string
  position: string
  phone: string
}

/** `?service=&package=`-ээс эхний утгыг уншина; буруу утгыг үл тооно. */
function useInitialValues(services: RequestContent["services"], prefill?: RequestPrefill): DefaultValues<RequestFormValues> {
  const params = useSearchParams()
  const service = parseService(params.get("service"))
  const pkg = params.get("package")
  const packageId = pkg && packagesFor(services, service).some((p) => p.id === pkg) ? pkg : ""
  return {
    name: prefill?.name ?? "",
    organization: prefill?.organization ?? "",
    position: prefill?.position ?? "",
    email: "",
    phone: prefill?.phone ?? "",
    service,
    packageId,
    message: "",
    meetingStart: "",
    meetingDuration: "60",
    meetingMode: "online",
    meetingAddress: "",
    meetingHost: ANY_HOST,
  }
}

function ContactFallback({ contact }: { contact: RequestContent["contact"] }) {
  const { phone, email } = contact
  return (
    <ul className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
      <li>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline">
          <Phone className="size-4" aria-hidden />
          {phone}
        </a>
      </li>
      <li>
        <a href={`mailto:${email}`} className="inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline">
          <Mail className="size-4" aria-hidden />
          {email}
        </a>
      </li>
    </ul>
  )
}

export function RequestForm({ prefill, content }: { prefill?: RequestPrefill; content: RequestContent }) {
  const { text, booking: bookingContent, contact, serviceOptions, services } = content
  const defaultValues = useInitialValues(services, prefill)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [pickerRefresh, setPickerRefresh] = useState(0)
  const [canBook, setCanBook] = useState(true)
  const statusRef = useRef<HTMLDivElement>(null)

  const form = useForm<RequestFormValues, unknown, RequestInput>({
    resolver: zodResolver(requestSchema),
    defaultValues,
    mode: "onTouched",
  })
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const service = useWatch({ control, name: "service" })
  const packages = packagesFor(services, service)
  const meetingStart = useWatch({ control, name: "meetingStart" }) ?? ""
  const meetingDuration = useWatch({ control, name: "meetingDuration" }) ?? "60"
  const meetingMode = useWatch({ control, name: "meetingMode" }) ?? "online"
  const meetingAddress = useWatch({ control, name: "meetingAddress" }) ?? ""
  const meetingHost = useWatch({ control, name: "meetingHost" }) ?? ANY_HOST

  // Үр дүн гарахад дэлгэц уншигч болон keyboard хэрэглэгчийг мэдэгдэл рүү шилжүүлнэ
  useEffect(() => {
    if (result) statusRef.current?.focus()
  }, [result])

  async function onValid(values: RequestInput, event?: BaseSyntheticEvent) {
    setShowSummary(false)
    setResult(null)
    const form = event?.target instanceof HTMLFormElement ? event.target : undefined
    const honeypot = form ? String(new FormData(form).get("website") ?? "") : undefined
    const next = await submitRequest(values, content, { honeypot })
    setResult(next)
    if (next.status === "mailto") openMailClient(next.href)
    if (next.status === "slot-taken") {
      setValue("meetingStart", "")
      setPickerRefresh((n) => n + 1)
    }
  }

  function onInvalid() {
    setResult(null)
    setShowSummary(true)
  }

  function startOver() {
    reset()
    setResult(null)
  }

  if (result?.status === "sent") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-4 rounded-xl bg-card p-8 ring-1 ring-foreground/10 outline-none"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <h2 className="text-2xl font-bold">{text.status.sent.title}</h2>
        <p className="text-muted-foreground">{text.status.sent.description}</p>
        <Button variant="outline" onClick={startOver}>
          {text.status.sent.again}
        </Button>
      </div>
    )
  }

  if (result?.status === "booked") {
    const booked = bookingContent.status.booked
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-4 rounded-xl bg-card p-8 ring-1 ring-foreground/10 outline-none"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarCheck className="size-6" aria-hidden />
        </span>
        <h2 className="text-2xl font-bold">{booked.title}</h2>
        <p className="text-lg font-semibold text-primary">{formatMeeting(result.start, result.duration)}</p>
        <p className="text-muted-foreground">{booked.description}</p>
        {result.host && (
          <p className="text-sm">
            <span className="text-muted-foreground">{bookingContent.hostLabel}:</span> <span className="font-medium">{result.host}</span>
          </p>
        )}
        {result.mode === "online" ? (
          <p className="flex items-center gap-2 text-sm">
            <Video className="size-4 shrink-0 text-primary" aria-hidden />
            {result.joinLink ? (
              <a href={result.joinLink} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
                {booked.meetLink}
              </a>
            ) : (
              booked.meet
            )}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            {result.mode === "visit" ? `${booked.visit} ${result.address ?? ""}` : `${booked.office} ${contact.address}`}
          </p>
        )}
        <Button variant="outline" onClick={startOver}>
          {booked.again}
        </Button>
      </div>
    )
  }

  const errorId = (name: keyof RequestFormValues) => `${name}-error`
  const describedBy = (name: keyof RequestFormValues, extra?: string) =>
    [errors[name] ? errorId(name) : null, extra].filter(Boolean).join(" ") || undefined

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 md:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">{text.title}</h2>
        <p className="text-sm text-muted-foreground">{text.requiredNote}</p>
      </div>

      {/* Төлөвийн мэдэгдэл (aria-live) */}
      <div aria-live="polite" aria-atomic="true">
        {result?.status === "mailto" && (
          <div
            ref={statusRef}
            tabIndex={-1}
            className="rounded-lg bg-primary/5 p-4 text-sm ring-1 ring-primary/20 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <p className="flex items-center gap-2 font-semibold text-primary">
              <Mail className="size-4 shrink-0" aria-hidden />
              {text.status.mailto.title}
            </p>
            <p className="mt-1.5 text-muted-foreground">{text.status.mailto.description}</p>
            <Button asChild size="sm" className="mt-3">
              <a href={result.href}>{text.status.mailto.reopen}</a>
            </Button>
            <p className="mt-4 text-muted-foreground">{text.status.mailto.fallback}</p>
            <ContactFallback contact={contact} />
          </div>
        )}
        {result?.status === "error" && (
          <div
            ref={statusRef}
            tabIndex={-1}
            className="rounded-lg bg-destructive/10 p-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <p className="flex items-center gap-2 font-semibold text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {text.status.error.title}
            </p>
            <p className="mt-1.5 text-muted-foreground">
              {result.message} {text.status.error.description}
            </p>
            <ContactFallback contact={contact} />
          </div>
        )}
        {result?.status === "slot-taken" && (
          <div
            ref={statusRef}
            tabIndex={-1}
            className="rounded-lg bg-destructive/10 p-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <p className="flex items-center gap-2 font-semibold text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {bookingContent.status.slotTaken.title}
            </p>
            <p className="mt-1.5 text-muted-foreground">{result.message}</p>
          </div>
        )}
        {!result && showSummary && Object.keys(errors).length > 0 && (
          <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {fill(text.invalidSummary, { count: Object.keys(errors).length })}
          </p>
        )}
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(onValid, onInvalid)}
        className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8"
      >
        {/* Ботод зориулсан нуугдмал талбар — хүн бөглөхгүй */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <div className="grid grid-cols-[minmax(0,1fr)] content-start gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">
              {text.fields.name.label} <span aria-hidden>*</span>
            </FieldLabel>
            <Input
              id="name"
              autoComplete="given-name"
              placeholder={text.fields.name.placeholder}
              aria-required
              aria-invalid={!!errors.name}
              aria-describedby={describedBy("name")}
              {...register("name")}
            />
            <FieldError id={errorId("name")} errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.organization}>
            <FieldLabel htmlFor="organization">
              {text.fields.organization.label} <span aria-hidden>*</span>
            </FieldLabel>
            <Input
              id="organization"
              autoComplete="organization"
              placeholder={text.fields.organization.placeholder}
              aria-required
              aria-invalid={!!errors.organization}
              aria-describedby={describedBy("organization")}
              {...register("organization")}
            />
            <FieldError id={errorId("organization")} errors={[errors.organization]} />
          </Field>

          <Field data-invalid={!!errors.position}>
            <FieldLabel htmlFor="position">
              {text.fields.position.label} <span aria-hidden>*</span>
            </FieldLabel>
            <Input
              id="position"
              autoComplete="organization-title"
              placeholder={text.fields.position.placeholder}
              aria-required
              aria-invalid={!!errors.position}
              aria-describedby={describedBy("position")}
              {...register("position")}
            />
            <FieldError id={errorId("position")} errors={[errors.position]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">
              {text.fields.email.label} <span aria-hidden>*</span>
            </FieldLabel>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={text.fields.email.placeholder}
              aria-required
              aria-invalid={!!errors.email}
              aria-describedby={describedBy("email")}
              {...register("email")}
            />
            <FieldError id={errorId("email")} errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">
              {text.fields.phone.label} <span aria-hidden>*</span>
            </FieldLabel>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={text.fields.phone.placeholder}
              aria-required
              aria-invalid={!!errors.phone}
              aria-describedby={describedBy("phone")}
              {...register("phone")}
            />
            <FieldError id={errorId("phone")} errors={[errors.phone]} />
          </Field>

          <Field data-invalid={!!errors.service}>
            <FieldLabel htmlFor="service">
              {text.fields.service.label} <span aria-hidden>*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="service"
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    field.onChange(value)
                    setValue("packageId", "")
                  }}
                >
                  <SelectTrigger
                    id="service"
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className="w-full"
                    aria-required
                    aria-invalid={!!errors.service}
                    aria-describedby={describedBy("service")}
                  >
                    <SelectValue placeholder={text.fields.service.placeholder} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {serviceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError id={errorId("service")} errors={[errors.service]} />
          </Field>

          <Field data-invalid={!!errors.packageId} className="sm:col-span-2">
            <FieldLabel htmlFor="packageId">
              {text.fields.packageId.label}{" "}
              <span className="font-normal text-muted-foreground">{text.optional}</span>
            </FieldLabel>
            <Controller
              control={control}
              name="packageId"
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={packages.length === 0}
                >
                  <SelectTrigger
                    id="packageId"
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className="w-full"
                    aria-invalid={!!errors.packageId}
                    aria-describedby={describedBy("packageId", "packageId-description")}
                  >
                    <SelectValue
                      placeholder={
                        packages.length === 0
                          ? text.fields.packageId.disabledPlaceholder
                          : text.fields.packageId.placeholder
                      }
                    />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={UNDECIDED_PACKAGE}>{text.fields.packageId.undecided}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldDescription id="packageId-description">{text.fields.packageId.description}</FieldDescription>
            <FieldError id={errorId("packageId")} errors={[errors.packageId]} />
          </Field>

          <Field data-invalid={!!errors.message} className="sm:col-span-2">
            <FieldLabel htmlFor="message">
              {text.fields.message.label}{" "}
              <span className="font-normal text-muted-foreground">{text.optional}</span>
            </FieldLabel>
            <Textarea
              id="message"
              rows={5}
              placeholder={text.fields.message.placeholder}
              aria-invalid={!!errors.message}
              aria-describedby={describedBy("message")}
              {...register("message")}
            />
            <FieldError id={errorId("message")} errors={[errors.message]} />
          </Field>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <MeetingPicker
            t={bookingContent}
            hosts={content.hosts}
            start={meetingStart}
            duration={meetingDuration}
            mode={meetingMode}
            onStartChange={(value) => setValue("meetingStart", value)}
            onDurationChange={(value) => setValue("meetingDuration", value)}
            onModeChange={(value) => setValue("meetingMode", value)}
            refreshKey={pickerRefresh}
            onCanBookChange={setCanBook}
            host={meetingHost}
            onHostChange={(value) => setValue("meetingHost", value)}
            address={meetingAddress}
            onAddressChange={(value) => setValue("meetingAddress", value, { shouldValidate: !!errors.meetingAddress })}
            addressError={errors.meetingAddress?.message}
          />
          <FieldError errors={[errors.meetingStart]} className="mt-2" />
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto sm:justify-self-start lg:col-span-2">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
              {text.submitting}
            </>
          ) : (
            <>
              <Send data-icon="inline-start" aria-hidden />
              {meetingStart
                ? canBook
                  ? bookingContent.submitWithMeeting
                  : bookingContent.submitWithMeetingRequest
                : text.submit}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
