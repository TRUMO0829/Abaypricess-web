"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CheckCircle2, Loader2, Mail, Phone, Send } from "lucide-react"
import { Controller, useForm, useWatch, type DefaultValues } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { company } from "@/content/company"
import { requestFormContent, serviceOptions } from "@/content/contact"
import { getService } from "@/content/services"
import { openMailClient, submitRequest, type SubmitResult } from "@/lib/request"
import {
  requestSchema,
  requestServiceValues,
  UNDECIDED_PACKAGE,
  type RequestFormValues,
  type RequestInput,
} from "@/lib/request-schema"

type ServiceValue = (typeof requestServiceValues)[number]

const text = requestFormContent

function parseService(value: string | null): ServiceValue | undefined {
  return requestServiceValues.find((option) => option === value)
}

function packagesFor(service: ServiceValue | undefined) {
  return service && service !== "other" ? (getService(service)?.packages ?? []) : []
}

/** `?service=&package=`-ээс эхний утгыг уншина; буруу утгыг үл тооно. */
function useInitialValues(): DefaultValues<RequestFormValues> {
  const params = useSearchParams()
  const service = parseService(params.get("service"))
  const pkg = params.get("package")
  const packageId = pkg && packagesFor(service).some((p) => p.id === pkg) ? pkg : ""
  return { name: "", organization: "", position: "", email: "", phone: "", service, packageId, message: "" }
}

function ContactFallback() {
  const { phone, email } = company.contact
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

export function RequestForm() {
  const defaultValues = useInitialValues()
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [showSummary, setShowSummary] = useState(false)
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
  const packages = packagesFor(service)

  // Үр дүн гарахад дэлгэц уншигч болон keyboard хэрэглэгчийг мэдэгдэл рүү шилжүүлнэ
  useEffect(() => {
    if (result) statusRef.current?.focus()
  }, [result])

  async function onValid(values: RequestInput) {
    setShowSummary(false)
    setResult(null)
    const next = await submitRequest(values)
    setResult(next)
    if (next.status === "mailto") openMailClient(next.href)
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
            <ContactFallback />
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
            <ContactFallback />
          </div>
        )}
        {!result && showSummary && Object.keys(errors).length > 0 && (
          <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {text.invalidSummary(Object.keys(errors).length)}
          </p>
        )}
      </div>

      <form noValidate onSubmit={handleSubmit(onValid, onInvalid)} className="flex flex-col gap-6">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">
              {text.fields.name.label} <span aria-hidden>*</span>
            </FieldLabel>
            <Input
              id="name"
              autoComplete="name"
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
              {text.fields.position.label}{" "}
              <span className="font-normal text-muted-foreground">{text.optional}</span>
            </FieldLabel>
            <Input
              id="position"
              autoComplete="organization-title"
              placeholder={text.fields.position.placeholder}
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

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto sm:self-start">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
              {text.submitting}
            </>
          ) : (
            <>
              <Send data-icon="inline-start" aria-hidden />
              {text.submit}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
