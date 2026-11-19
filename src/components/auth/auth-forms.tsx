"use client"

import { useActionState } from "react"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authContent as t } from "@/content/auth"
import { loginAction, registerAction, type AuthFormState } from "@/lib/auth/actions"
import type { LoginField, RegisterField } from "@/lib/auth/schema"

type FieldName = RegisterField | LoginField

const inputProps: Partial<Record<FieldName, React.ComponentProps<"input">>> = {
  name: { autoComplete: "given-name" },
  company: { autoComplete: "organization" },
  position: { autoComplete: "organization-title" },
  phone: { type: "tel", inputMode: "tel", autoComplete: "tel" },
  password: { type: "password" },
  confirmPassword: { type: "password", autoComplete: "new-password" },
}

function AuthField({
  name,
  state,
  autoComplete,
  autoFocus,
}: {
  name: FieldName
  state: AuthFormState<FieldName>
  autoComplete?: string
  autoFocus?: boolean
}) {
  const error = state.errors?.[name]
  const errorId = error ? `${name}-error` : undefined
  const { label, placeholder } = t.fields[name]
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>
        {label} <span aria-hidden>*</span>
      </FieldLabel>
      <Input
        id={name}
        name={name}
        placeholder={placeholder || undefined}
        defaultValue={name === "password" || name === "confirmPassword" ? undefined : (state.values?.[name] ?? "")}
        aria-required
        aria-invalid={!!error}
        aria-describedby={errorId}
        autoFocus={autoFocus}
        {...inputProps[name]}
        {...(autoComplete ? { autoComplete } : {})}
      />
      <FieldError id={errorId} errors={[error ? { message: error } : undefined]} />
    </Field>
  )
}

function FormMessage({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  )
}

function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
      {pending ? pendingLabel : label}
    </Button>
  )
}

const withNext = (href: string, next: string) => (next === "/" ? href : `${href}?next=${encodeURIComponent(next)}`)

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, {} as AuthFormState<LoginField>)
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <FormMessage message={state.message} />
      <AuthField name="phone" state={state} autoFocus />
      <AuthField name="password" state={state} autoComplete="current-password" />
      <SubmitButton pending={pending} label={t.login.submit} pendingLabel={t.login.submitting} />
      <p className="text-center text-sm text-muted-foreground">
        {t.login.noAccount}{" "}
        <Link href={withNext("/register", next)} className="font-medium text-primary underline-offset-4 hover:underline">
          {t.login.toRegister}
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">{t.login.forgot}</p>
    </form>
  )
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerAction, {} as AuthFormState<RegisterField>)
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <FormMessage message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField name="name" state={state} autoFocus />
        <AuthField name="phone" state={state} />
        <AuthField name="company" state={state} />
        <AuthField name="position" state={state} />
        <AuthField name="password" state={state} autoComplete="new-password" />
        <AuthField name="confirmPassword" state={state} />
      </div>
      <SubmitButton pending={pending} label={t.register.submit} pendingLabel={t.register.submitting} />
      <p className="text-center text-sm text-muted-foreground">
        {t.register.hasAccount}{" "}
        <Link href={withNext("/login", next)} className="font-medium text-primary underline-offset-4 hover:underline">
          {t.register.toLogin}
        </Link>
      </p>
    </form>
  )
}
