import { z } from "zod"

import { MN_PHONE_REGEX } from "@/lib/request-schema"

/** "+976 9911-2233" → "99112233" (бүртгэлд 8 оронтойгоор хадгална). */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "")
  return digits.length === 11 && digits.startsWith("976") ? digits.slice(3) : digits
}

const phone = z
  .string()
  .trim()
  .min(1, { error: "Утасны дугаараа оруулна уу" })
  .regex(MN_PHONE_REGEX, { error: "Утасны дугаар 8 оронтой байна (ж: 9911 2233)" })
  .transform(normalizePhone)

export const PASSWORD_MIN = 8
/** bcrypt 72 байтаас хойшхийг үл тоодог */
export const PASSWORD_MAX = 72

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: "Нэрээ оруулна уу" })
      .min(2, { error: "Нэр хэт богино байна" })
      .max(100, { error: "100 тэмдэгтээс хэтрэхгүй" }),
    company: z
      .string()
      .trim()
      .min(1, { error: "Компанийн нэрээ оруулна уу" })
      .min(2, { error: "Компанийн нэр хэт богино байна" })
      .max(150, { error: "150 тэмдэгтээс хэтрэхгүй" }),
    position: z
      .string()
      .trim()
      .min(1, { error: "Албан тушаалаа оруулна уу" })
      .min(2, { error: "Албан тушаал хэт богино байна" })
      .max(100, { error: "100 тэмдэгтээс хэтрэхгүй" }),
    phone,
    password: z
      .string()
      .min(PASSWORD_MIN, { error: `Нууц үг дор хаяж ${PASSWORD_MIN} тэмдэгт байна` })
      .max(PASSWORD_MAX, { error: `${PASSWORD_MAX} тэмдэгтээс хэтрэхгүй` }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Нууц үг таарахгүй байна",
  })

export const loginSchema = z.object({
  phone,
  password: z.string().min(1, { error: "Нууц үгээ оруулна уу" }).max(PASSWORD_MAX),
})

export type RegisterInput = z.output<typeof registerSchema>
export type RegisterField = keyof z.input<typeof registerSchema>
export type LoginField = keyof z.input<typeof loginSchema>

/** Нэвтэрсний дараа буцах хаяг — зөвхөн дотоод зам ("/contact?service=training"). */
export function safeNext(value: unknown): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/"
}
