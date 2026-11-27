import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import { getAdminStore, type AdminStore } from "@/lib/admin/store"

/*
 * Админы session: HttpOnly cookie-д санамсаргүй token. Token-ийн sha256 нь DB-д 12 цаг хадгалагдаж,
 * админы үйлдэл бүрт DB дотор дахин шалгагдана (cookie хуурамчаар үүсгэх боломжгүй).
 */

const COOKIE = "adapt_admin"
const MAX_AGE_SECONDS = 12 * 60 * 60

export async function getAdminToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null
}

/** Server Action-д л дуудна. */
export async function setAdminToken(token: string): Promise<void> {
  ;(await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearAdminToken(): Promise<void> {
  ;(await cookies()).delete({ name: COOKIE, path: "/admin" })
}

export interface AdminContext {
  store: AdminStore
  token: string
  username: string
}

/** Нэвтрээгүй бол `/admin/login` руу. Server Component (Suspense дотор) болон Server Action-д. */
export async function requireAdmin(): Promise<AdminContext> {
  const store = getAdminStore()
  const token = await getAdminToken()
  // Session-ийн хугацааг хүсэлт бүрт шалгана (prerender-д биш)
  await connection()
  const username = store && token ? await store.sessionUser(token) : null
  if (!store || !token || !username) redirect("/admin/login")
  return { store, token, username }
}
