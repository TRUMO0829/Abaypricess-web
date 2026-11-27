"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { clearAdminToken, getAdminToken, requireAdmin, setAdminToken } from "@/lib/admin/session"
import { getAdminStore } from "@/lib/admin/store"
import { CONTENT_TAG } from "@/lib/content"
import { defaultContent } from "@/lib/content/defaults"
import { sanitize } from "@/lib/content/merge"
import { getContentSection } from "@/lib/content/sections"

export interface AdminLoginState {
  message?: string
  username?: string
}

const rateStore = globalThis as typeof globalThis & { __adaptAdminRate?: Map<string, number[]> }

/** IP тус бүрээс 15 минутад 10 буруу оролдлого (DB нь хэрэглэгч тус бүрийг 5 буруу оролдлогоор түгждэг). */
async function failures(record: boolean): Promise<number> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  rateStore.__adaptAdminRate ??= new Map()
  const recent = (rateStore.__adaptAdminRate.get(ip) ?? []).filter((time) => now - time < 15 * 60_000)
  if (record) recent.push(now)
  rateStore.__adaptAdminRate.set(ip, recent)
  return recent.length
}

export async function adminLoginAction(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "").trim().slice(0, 100)
  const password = String(formData.get("password") ?? "").slice(0, 200)
  if (!username || !password) return { message: "Нэвтрэх нэр, нууц үгээ оруулна уу.", username }

  const store = getAdminStore()
  if (!store) return { message: "Админы хэсэг тохируулагдаагүй байна (Supabase env).", username }
  if ((await failures(false)) >= 10) return { message: "Хэт олон оролдлого. 15 минутын дараа дахин оролдоно уу.", username }

  const result = await store.login(username, password)
  if (!result.ok) {
    if (result.reason !== "error") await failures(true)
    const message =
      result.reason === "locked"
        ? "Олон удаа буруу оролдсон тул 15 минут түгжигдлээ."
        : result.reason === "invalid"
          ? "Нэвтрэх нэр эсвэл нууц үг буруу байна."
          : "Админы үйлчилгээнд холбогдож чадсангүй. Supabase migration ажилласан эсэхийг шалгана уу."
    return { message, username }
  }
  await setAdminToken(result.token)
  redirect("/admin")
}

export async function adminLogoutAction(): Promise<void> {
  const token = await getAdminToken()
  if (token) await getAdminStore()?.logout(token).catch(() => undefined)
  await clearAdminToken()
  redirect("/admin/login")
}

export type SaveContentResult = { ok: true; savedAt: string } | { ok: false; message: string }

/** Хэсгийн бүх талбарыг хадгална. Зөвхөн default-д байгаа, засаж болох талбар л үлдэнэ (`sanitize`). */
export async function saveContentAction(sectionKey: string, values: Record<string, unknown>): Promise<SaveContentResult> {
  const { store, token } = await requireAdmin()
  const section = getContentSection(sectionKey)
  if (!section || typeof values !== "object" || values === null) return { ok: false, message: "Хэсэг олдсонгүй." }

  const data: Record<string, unknown> = {}
  for (const field of section.fields) {
    const clean = sanitize(defaultContent[field.key], values[field.key], [field.key])
    if (clean !== undefined) data[field.key] = clean
  }
  try {
    await store.saveContent(token, section.key, data)
  } catch (error) {
    console.error("[admin] save", error)
    return { ok: false, message: "Хадгалж чадсангүй. Дахин нэвтэрч оролдоно уу." }
  }
  updateTag(CONTENT_TAG)
  return { ok: true, savedAt: new Date().toISOString() }
}

/** Хэсгийг кодын анхны текст рүү буцаана. */
export async function resetContentAction(sectionKey: string): Promise<SaveContentResult> {
  const { store, token } = await requireAdmin()
  const section = getContentSection(sectionKey)
  if (!section) return { ok: false, message: "Хэсэг олдсонгүй." }
  try {
    await store.saveContent(token, section.key, null)
  } catch (error) {
    console.error("[admin] reset", error)
    return { ok: false, message: "Буцааж чадсангүй. Дахин нэвтэрч оролдоно уу." }
  }
  updateTag(CONTENT_TAG)
  return { ok: true, savedAt: new Date().toISOString() }
}
