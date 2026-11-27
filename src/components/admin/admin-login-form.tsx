"use client"

import { useActionState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { adminLoginAction, type AdminLoginState } from "@/lib/admin/actions"

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<AdminLoginState, FormData>(adminLoginAction, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.message && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      )}
      <Field>
        <FieldLabel htmlFor="username">Нэвтрэх нэр</FieldLabel>
        <Input id="username" name="username" autoComplete="username" defaultValue={state.username ?? ""} required autoFocus />
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Нууц үг</FieldLabel>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 data-icon="inline-start" className="animate-spin" />}
        Нэвтрэх
      </Button>
    </form>
  )
}
