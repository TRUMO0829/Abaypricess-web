import "server-only"

import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto"

/*
 * Админы өгөгдөл: Supabase (`supabase/migrations/*_admin_panel.sql`) эсвэл туршилтын санах ой.
 * Хүснэгтүүд RLS-тэй, policy-гүй — сайт зөвхөн SECURITY DEFINER функцуудыг publishable key-ээр дуудна.
 * Админы бүх үйлдэл нэвтрэх үед өгсөн token-оор DB дотор шалгагдана.
 */

export interface CustomerAccount {
  id: string
  created_at: string
  name: string
  company: string
  position: string
  phone: string
  last_login_at: string | null
}

export type ContentRows = Record<string, { data: unknown; updated_at: string }>

export type AdminLoginResult = { ok: true; token: string } | { ok: false; reason: "invalid" | "locked" | "error" }

export interface AdminStore {
  kind: "supabase" | "mock"
  login(username: string, password: string): Promise<AdminLoginResult>
  sessionUser(token: string): Promise<string | null>
  logout(token: string): Promise<void>
  listAccounts(token: string): Promise<CustomerAccount[]>
  /** `data: null` → анхны (кодын) утга руу буцаана */
  saveContent(token: string, key: string, data: unknown): Promise<void>
  readContent(): Promise<ContentRows>
  /** Зураг хадгалаад id буцаана (`/media/<id>`) */
  uploadMedia(token: string, mime: MediaMime, data: Buffer): Promise<string>
  readMedia(id: string): Promise<{ mime: string; data: Buffer } | null>
}

export const MEDIA_MIMES = ["image/jpeg", "image/png", "image/webp"] as const
export type MediaMime = (typeof MEDIA_MIMES)[number]
export const MEDIA_MAX_BYTES = 2_000_000
const MEDIA_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
export const isMediaId = (id: string) => MEDIA_ID.test(id)

class AdminStoreError extends Error {}

function supabaseStore(url: string, key: string): AdminStore {
  async function rpc(fn: string, body: Record<string, unknown>) {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const json = (await res.json().catch(() => null)) as unknown
    const message = json && typeof json === "object" && "message" in json ? String(json.message) : ""
    return { ok: res.ok, json, message }
  }

  return {
    kind: "supabase",
    async login(username, password) {
      const { ok, json, message } = await rpc("admin_login", { p_username: username, p_password: password })
      if (!ok) {
        if (message === "locked") return { ok: false, reason: "locked" }
        console.error("[admin] login", message)
        return { ok: false, reason: "error" }
      }
      return typeof json === "string" && json ? { ok: true, token: json } : { ok: false, reason: "invalid" }
    },
    async sessionUser(token) {
      const { ok, json } = await rpc("admin_session_user", { p_token: token })
      return ok && typeof json === "string" ? json : null
    },
    async logout(token) {
      await rpc("admin_logout", { p_token: token })
    },
    async listAccounts(token) {
      const { ok, json, message } = await rpc("admin_list_accounts", { p_token: token })
      if (!ok) throw new AdminStoreError(message || "list_accounts")
      return Array.isArray(json) ? (json as CustomerAccount[]) : []
    },
    async saveContent(token, contentKey, data) {
      const { ok, message } = await rpc("admin_save_content", { p_token: token, p_key: contentKey, p_data: data })
      if (!ok) throw new AdminStoreError(message || "save_content")
    },
    async readContent() {
      const { ok, json, message } = await rpc("get_site_content", {})
      if (!ok) {
        // Migration ажиллаагүй бол сайт кодын текстээр ажилласаар байна
        console.error("[content] read", message)
        return {}
      }
      const rows: ContentRows = {}
      if (Array.isArray(json)) {
        for (const row of json as { key: string; data: unknown; updated_at: string }[]) {
          rows[row.key] = { data: row.data, updated_at: row.updated_at }
        }
      }
      return rows
    },
    async uploadMedia(token, mime, data) {
      const { ok, json, message } = await rpc("admin_upload_media", { p_token: token, p_mime: mime, p_data: data.toString("base64") })
      if (!ok || typeof json !== "string") throw new AdminStoreError(message || "upload_media")
      return json
    },
    async readMedia(id) {
      if (!isMediaId(id)) return null
      const { ok, json } = await rpc("get_media", { p_id: id })
      const row = ok && Array.isArray(json) ? (json[0] as { mime: string; data: string } | undefined) : undefined
      return row ? { mime: row.mime, data: Buffer.from(row.data, "base64") } : null
    },
  }
}

/* ── Туршилтын сан (dev, e2e). Нууц үг: `ADMIN_DEV_PASSWORD` (тохируулаагүй бол нэвтрэх боломжгүй) ─────── */

const mem = globalThis as typeof globalThis & {
  __adaptAdmin?: { sessions: Map<string, number>; content: ContentRows; media: Map<string, { mime: string; data: Buffer }> }
  /** `lib/auth/store.ts`-ийн туршилтын бүртгэлүүд */
  __adaptAccounts?: Map<string, Omit<CustomerAccount, "created_at" | "last_login_at">>
}
function memState() {
  mem.__adaptAdmin ??= { sessions: new Map(), content: {}, media: new Map() }
  mem.__adaptAdmin.media ??= new Map()
  return mem.__adaptAdmin
}
const sha = (value: string) => createHash("sha256").update(value).digest()

const memoryStore: AdminStore = {
  kind: "mock",
  async login(username, password) {
    const expected = process.env.ADMIN_DEV_PASSWORD
    if (!expected) return { ok: false, reason: "error" }
    const salt = "adapt-admin-dev"
    const okUser = username.trim().toLowerCase() === "admin"
    const okPassword = timingSafeEqual(scryptSync(password, salt, 32), scryptSync(expected, salt, 32))
    if (!okUser || !okPassword) return { ok: false, reason: "invalid" }
    const token = randomBytes(32).toString("hex")
    memState().sessions.set(sha(token).toString("hex"), Date.now() + 12 * 3600_000)
    return { ok: true, token }
  },
  async sessionUser(token) {
    const expires = memState().sessions.get(sha(token).toString("hex"))
    return expires && expires > Date.now() ? "admin" : null
  },
  async logout(token) {
    memState().sessions.delete(sha(token).toString("hex"))
  },
  async listAccounts(token) {
    if (!(await memoryStore.sessionUser(token))) throw new AdminStoreError("unauthorized")
    return [...(mem.__adaptAccounts?.values() ?? [])].map(({ id, name, company, position, phone }) => ({
      id,
      name,
      company,
      position,
      phone,
      created_at: new Date().toISOString(),
      last_login_at: null,
    }))
  },
  async saveContent(token, key, data) {
    if (!(await memoryStore.sessionUser(token))) throw new AdminStoreError("unauthorized")
    const { content } = memState()
    if (data === null) delete content[key]
    else content[key] = { data, updated_at: new Date().toISOString() }
  },
  async readContent() {
    return structuredClone(memState().content)
  },
  async uploadMedia(token, mime, data) {
    if (!(await memoryStore.sessionUser(token))) throw new AdminStoreError("unauthorized")
    const id = randomUUID()
    memState().media.set(id, { mime, data })
    return id
  },
  async readMedia(id) {
    return memState().media.get(id) ?? null
  },
}

/**
 * `ADMIN_MOCK=1` (e2e) → санах ой. Supabase env бүрэн бол Supabase. Dev горимд env байхгүй бол санах ой.
 * Production-д тохиргоогүй бол `null`.
 */
export function getAdminStore(): AdminStore | null {
  if (process.env.ADMIN_MOCK === "1") return memoryStore
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env
  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) return supabaseStore(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  if (process.env.NODE_ENV === "development") return memoryStore
  return null
}
