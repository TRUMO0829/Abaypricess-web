"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { clearAdminToken, getAdminToken, requireAdmin, setAdminToken } from "@/lib/admin/session"
import { getAdminStore, MEDIA_MAX_BYTES, type MediaMime } from "@/lib/admin/store"
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

export type UploadMediaResult = { ok: true; url: string } | { ok: false; message: string }

/** Файлын эхний байтаар зургийн төрлийг тодорхойлно (браузерын хэлсэн төрөлд итгэхгүй). */
function sniffImage(bytes: Buffer): MediaMime | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg"
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png"
  if (bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp"
  if (bytes.length > 5 && bytes.toString("ascii", 0, 5) === "%PDF-") return "application/pdf"
  return null
}

/**
 * Зураг (`kind: "image"`, хүний карт) эсвэл PDF (`kind: "pdf"`, үйлчилгээний материал).
 * Буцаасан `url`-ийг `photo` / `file` талбарт хадгална.
 */
export async function uploadMediaAction(formData: FormData): Promise<UploadMediaResult> {
  const { store, token } = await requireAdmin()
  const pdf = formData.get("kind") === "pdf"
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: pdf ? "PDF файл сонгоно уу." : "Зураг сонгоно уу." }
  const bytes = Buffer.from(await file.arrayBuffer())
  const mime = sniffImage(bytes)
  if (pdf ? mime !== "application/pdf" : !mime || mime === "application/pdf") {
    return { ok: false, message: pdf ? "Зөвхөн PDF файл оруулна." : "Зөвхөн JPG, PNG, WebP зураг оруулна." }
  }
  if (!mime) return { ok: false, message: "Файлын төрөл танигдсангүй." }
  if (bytes.length > MEDIA_MAX_BYTES[mime]) {
    return { ok: false, message: pdf ? "PDF файл 4MB-аас бага байх ёстой." : "Зураг 2MB-аас бага байх ёстой." }
  }
  try {
    const id = await store.uploadMedia(token, mime, bytes)
    return { ok: true, url: `/media/${id}` }
  } catch (error) {
    console.error("[admin] upload", error)
    return { ok: false, message: "Файл хадгалж чадсангүй. Supabase-д файлын migration ажилласан эсэхийг шалгана уу." }
  }
}
