"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { loginSchema, registerSchema, safeNext, type LoginField, type RegisterField } from "@/lib/auth/schema"
import { clearSession, sessionConfigured, setSession } from "@/lib/auth/session"
import { getAccountStore } from "@/lib/auth/store"
import { getSiteContent } from "@/lib/content"

export interface AuthFormState<F extends string> {
  /** Талбар тус бүрийн алдаа */
  errors?: Partial<Record<F, string>>
  /** Маягтын ерөнхий алдаа */
  message?: string
  /** Алдаатай үед маягтыг дахин бөглөхөд (нууц үгээс бусад) */
  values?: Partial<Record<F, string>>
}

const rateStore = globalThis as typeof globalThis & { __adaptAuthRate?: Map<string, number[]> }

/** IP тус бүрээс 10 минутад `max` оролдлогоос илүүг хүлээж авахгүй (DB нь бүртгэл тус бүрийг мөн түгждэг). */
async function rateLimited(scope: string, max: number): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const key = `${scope}:${ip}`
  const now = Date.now()
  rateStore.__adaptAuthRate ??= new Map()
  const recent = (rateStore.__adaptAuthRate.get(key) ?? []).filter((time) => now - time < 10 * 60_000)
  if (recent.length >= max) return true
  rateStore.__adaptAuthRate.set(key, [...recent, now])
  return false
}

function fieldErrors<F extends string>(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Partial<Record<F, string>> = {}
  for (const issue of issues) {
    const key = issue.path[0] as F
    errors[key] ??= issue.message
  }
  return errors
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "")

export async function registerAction(
  _prev: AuthFormState<RegisterField>,
  formData: FormData
): Promise<AuthFormState<RegisterField>> {
  const values = {
    name: text(formData, "name"),
    company: text(formData, "company"),
    position: text(formData, "position"),
    phone: text(formData, "phone"),
  }
  const t = (await getSiteContent()).authContent
  const store = getAccountStore()
  if (!store || !sessionConfigured()) return { message: t.unavailable, values }

  const parsed = registerSchema.safeParse({
    ...values,
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  })
  if (!parsed.success) return { errors: fieldErrors<RegisterField>(parsed.error.issues), values }

  if (store.kind === "supabase" && (await rateLimited("register", 5))) return { message: t.tooMany, values }

  const result = await store.register(parsed.data)
  if (!result.ok) {
    return result.reason === "phone_taken"
      ? { errors: { phone: t.register.phoneTaken }, values }
      : { message: t.error, values }
  }
  await setSession(result.account)
  redirect(safeNext(formData.get("next")))
}

export async function loginAction(_prev: AuthFormState<LoginField>, formData: FormData): Promise<AuthFormState<LoginField>> {
  const values = { phone: text(formData, "phone") }
  const t = (await getSiteContent()).authContent
  const store = getAccountStore()
  if (!store || !sessionConfigured()) return { message: t.unavailable, values }

  const parsed = loginSchema.safeParse({ ...values, password: text(formData, "password") })
  if (!parsed.success) return { errors: fieldErrors<LoginField>(parsed.error.issues), values }

  if (store.kind === "supabase" && (await rateLimited("login", 10))) return { message: t.tooMany, values }

  const result = await store.login(parsed.data.phone, parsed.data.password)
  if (!result.ok) {
    const message = result.reason === "locked" ? t.login.locked : result.reason === "invalid" ? t.login.invalid : t.error
    return { message, values }
  }
  await setSession(result.account)
  redirect(safeNext(formData.get("next")))
}

export async function logoutAction(formData: FormData): Promise<void> {
  await clearSession()
  redirect(safeNext(formData.get("next")))
}
