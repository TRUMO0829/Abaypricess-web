import "server-only"

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto"

import type { RegisterInput } from "@/lib/auth/schema"

/** Нэвтэрсэн хэрэглэгч — хүсэлтийн маягтад автоматаар бөглөгдөх 4 мэдээлэл */
export interface Account {
  id: string
  name: string
  company: string
  position: string
  phone: string
}

export type RegisterResult = { ok: true; account: Account } | { ok: false; reason: "phone_taken" | "error" }
export type LoginResult = { ok: true; account: Account } | { ok: false; reason: "invalid" | "locked" | "error" }

export interface AccountStore {
  kind: "supabase" | "mock"
  register(input: RegisterInput): Promise<RegisterResult>
  login(phone: string, password: string): Promise<LoginResult>
}

/* ── Supabase: `register_account` / `login_account` функц (нууц үгийг DB дотор bcrypt) ── */

function supabaseStore(url: string, key: string): AccountStore {
  async function rpc(fn: string, body: Record<string, string>) {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const json = (await res.json().catch(() => null)) as unknown
    return { ok: res.ok, json }
  }
  const message = (json: unknown) => (json && typeof json === "object" && "message" in json ? String(json.message) : "")
  const first = (json: unknown) => (Array.isArray(json) && json.length ? (json[0] as Account) : null)

  return {
    kind: "supabase",
    async register(input) {
      const { ok, json } = await rpc("register_account", {
        p_phone: input.phone,
        p_password: input.password,
        p_name: input.name,
        p_company: input.company,
        p_position: input.position,
      })
      if (!ok) {
        if (message(json) === "phone_taken") return { ok: false, reason: "phone_taken" }
        console.error("[auth] register", json)
        return { ok: false, reason: "error" }
      }
      const account = first(json)
      return account ? { ok: true, account } : { ok: false, reason: "error" }
    },
    async login(phone, password) {
      const { ok, json } = await rpc("login_account", { p_phone: phone, p_password: password })
      if (!ok) {
        if (message(json) === "locked") return { ok: false, reason: "locked" }
        console.error("[auth] login", json)
        return { ok: false, reason: "error" }
      }
      const account = first(json)
      return account ? { ok: true, account } : { ok: false, reason: "invalid" }
    },
  }
}

/* ── Туршилтын сан (dev, e2e): процессын санах ойд, scrypt ─────────────────────── */

interface MockRow extends Account {
  hash: string
}
const mem = globalThis as typeof globalThis & { __adaptAccounts?: Map<string, MockRow> }

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`
}

const memoryStore: AccountStore = {
  kind: "mock",
  async register(input) {
    mem.__adaptAccounts ??= new Map()
    if (mem.__adaptAccounts.has(input.phone)) return { ok: false, reason: "phone_taken" }
    const account: Account = { id: randomUUID(), name: input.name, company: input.company, position: input.position, phone: input.phone }
    mem.__adaptAccounts.set(input.phone, { ...account, hash: hashPassword(input.password) })
    return { ok: true, account }
  },
  async login(phone, password) {
    const row = mem.__adaptAccounts?.get(phone)
    if (!row) return { ok: false, reason: "invalid" }
    const [salt, expected] = row.hash.split(":")
    const actual = hashPassword(password, salt).split(":")[1]
    if (!timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"))) return { ok: false, reason: "invalid" }
    return { ok: true, account: { id: row.id, name: row.name, company: row.company, position: row.position, phone: row.phone } }
  },
}

/**
 * `AUTH_MOCK=1` (e2e) → санах ой. Supabase env бүрэн бол Supabase. Dev горимд env байхгүй бол санах ой.
 * Production-д тохиргоогүй бол `null` — нэвтрэх боломжгүй гэж харуулна.
 */
export function getAccountStore(): AccountStore | null {
  if (process.env.AUTH_MOCK === "1") return memoryStore
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env
  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) return supabaseStore(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  if (process.env.NODE_ENV === "development") return memoryStore
  return null
}
