import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { connection } from "next/server"

import type { Account } from "@/lib/auth/store"

/*
 * Нэвтрэлтийн session: HttpOnly cookie-д хэрэглэгчийн 4 мэдээлэл + хугацаа, `AUTH_SECRET`-ээр HMAC гарын үсэгтэй.
 * Сервер DB-ээс дахин уншихгүйгээр маягтыг бөглөнө. Гарын үсэггүй/хуучирсан cookie-г үл тооно.
 */

const COOKIE = "adapt_session"
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60

interface Payload extends Account {
  exp: number
}

function secret(): string | null {
  const value = process.env.AUTH_SECRET
  if (value && value.length >= 32) return value
  // Dev-д env тохируулаагүй ч ажиллана (production-д хэзээ ч хэрэглэгдэхгүй)
  return process.env.NODE_ENV === "development" ? "dev-only-auth-secret-not-for-production-use" : null
}

/** `AUTH_SECRET` тохируулагдсан эсэх (production-д байхгүй бол нэвтрэх хаалттай) */
export function sessionConfigured(): boolean {
  return secret() !== null
}

const b64 = (value: string | Buffer) => Buffer.from(value).toString("base64url")
const sign = (data: string, key: string) => createHmac("sha256", key).update(data).digest()

function encode(account: Account, key: string): string {
  const payload: Payload = { ...account, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS }
  const data = b64(JSON.stringify(payload))
  return `${data}.${b64(sign(data, key))}`
}

function decode(token: string, key: string): Account | null {
  const [data, signature] = token.split(".")
  if (!data || !signature) return null
  const expected = sign(data, key)
  const actual = Buffer.from(signature, "base64url")
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try {
    const { exp, id, name, company, position, phone } = JSON.parse(Buffer.from(data, "base64url").toString()) as Payload
    if (typeof exp !== "number" || exp < Date.now() / 1000) return null
    return { id, name, company, position, phone }
  } catch {
    return null
  }
}

/** Нэвтэрсэн хэрэглэгч (Server Component-д `<Suspense>` дотор дуудна — request-time өгөгдөл). */
export async function getSessionAccount(): Promise<Account | null> {
  const key = secret()
  const token = (await cookies()).get(COOKIE)?.value
  if (!key || !token) return null
  // Хугацаа шалгах Date.now() нь зөвхөн хүсэлтийн үед (prerender-д биш)
  await connection()
  return decode(token, key)
}

/** Server Action-д л дуудна. */
export async function setSession(account: Account): Promise<void> {
  const key = secret()
  if (!key) throw new Error("AUTH_SECRET тохируулаагүй")
  ;(await cookies()).set(COOKIE, encode(account, key), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearSession(): Promise<void> {
  ;(await cookies()).delete(COOKIE)
}
