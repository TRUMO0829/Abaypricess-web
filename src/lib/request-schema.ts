import { z } from "zod"

import { meetingDurationValues, meetingModeValues } from "@/content/booking"

/** Багц сонгоогүй гэдгийг илэрхийлэх Select-ийн утга (Radix Select хоосон утга зөвшөөрдөггүй). */
export const UNDECIDED_PACKAGE = "undecided"

/** «Аль ч зөвлөх» — Select хоосон утга зөвшөөрдөггүй */
export const ANY_HOST = "any"

export const requestServiceValues = ["training", "laboratory", "update", "other"] as const

/**
 * Монгол утасны дугаар: 8 орон, эхний орон 0 биш.
 * `+976`/`976` угтвар, хоосон зай, зураас зөвшөөрнө: "99112233", "9911 2233", "+976 9911-2233".
 */
export const MN_PHONE_REGEX = /^(?:\+?976[\s-]?)?[1-9]\d{3}[\s-]?\d{4}$/

/** Сул цагийн эхлэл: "2026-11-20T10:00:00+08:00" (lib/booking/slots.ts-ийн toLocalIso). */
const MEETING_START_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00[+-]\d{2}:\d{2}$/

const optionalText = (max: number, error: string) =>
  z
    .string()
    .trim()
    .max(max, { error })
    .optional()
    .transform((value) => (value ? value : undefined))

export const requestSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: "Нэрээ оруулна уу" })
      .min(2, { error: "Нэр хэт богино байна" })
      .max(100, { error: "100 тэмдэгтээс хэтрэхгүй" }),
    organization: z
      .string()
      .trim()
      .min(1, { error: "Байгууллагын нэрээ оруулна уу" })
      .min(2, { error: "Байгууллагын нэр хэт богино байна" })
      .max(150, { error: "150 тэмдэгтээс хэтрэхгүй" }),
    position: z
      .string()
      .trim()
      .min(1, { error: "Албан тушаалаа оруулна уу" })
      .min(2, { error: "Албан тушаал хэт богино байна" })
      .max(100, { error: "100 тэмдэгтээс хэтрэхгүй" }),
    email: z
      .string()
      .trim()
      .min(1, { error: "Имэйл хаягаа оруулна уу" })
      .pipe(z.email({ error: "Имэйл хаяг буруу байна (ж: name@company.mn)" })),
    phone: z
      .string()
      .trim()
      .min(1, { error: "Утасны дугаараа оруулна уу" })
      .regex(MN_PHONE_REGEX, { error: "Утасны дугаар 8 оронтой байна (ж: 9911 2233)" }),
    service: z.enum(requestServiceValues, { error: "Үйлчилгээгээ сонгоно уу" }),
    packageId: z
      .string()
      .optional()
      .transform((value) => (value && value !== UNDECIDED_PACKAGE ? value : undefined)),
    message: optionalText(2000, "2000 тэмдэгтээс хэтрэхгүй"),
    /** Уулзалтын цаг — заавал биш. Хоосон бол хүсэлт цаггүй илгээгдэнэ. */
    meetingStart: z
      .string()
      .optional()
      .transform((value) => (value ? value : undefined))
      .refine((value) => !value || MEETING_START_REGEX.test(value), { error: "Уулзалтын цаг буруу байна" }),
    meetingDuration: z.enum(meetingDurationValues).optional(),
    meetingMode: z.enum(meetingModeValues).optional(),
    /** Багийн гишүүний id; хоосон = аль ч зөвлөх */
    meetingHost: z
      .string()
      .optional()
      .transform((value) => (value && value !== ANY_HOST ? value : undefined))
      // Багийн гишүүдийг админ засдаг тул жагсаалтаар биш, хэлбэрээр шалгана (server createBooking жагсаалтаар шалгана)
      .refine((value) => !value || /^[a-z0-9][a-z0-9-]{0,60}$/.test(value), { error: "Уулзах хүн буруу байна" }),
    /** «Очиж уулзах» үед заавал */
    meetingAddress: optionalText(200, "200 тэмдэгтээс хэтрэхгүй"),
  })
  .superRefine((data, ctx) => {
    if (data.meetingStart && (!data.meetingDuration || !data.meetingMode)) {
      ctx.addIssue({ code: "custom", path: ["meetingStart"], message: "Уулзалтын хугацаа, хэлбэрээ сонгоно уу" })
    }
    if (data.meetingStart && data.meetingMode === "visit" && !data.meetingAddress) {
      ctx.addIssue({ code: "custom", path: ["meetingAddress"], message: "Уулзах хаягаа оруулна уу" })
    }
    // Багцыг админ засдаг тул хэлбэрээр шалгана; маягт зөвхөн тухайн үйлчилгээний багцыг санал болгоно
    if (data.packageId && (data.service === "other" || !/^[a-z0-9][a-z0-9-]{0,60}$/.test(data.packageId))) {
      ctx.addIssue({ code: "custom", path: ["packageId"], message: "Сонгосон үйлчилгээнд энэ багц байхгүй" })
    }
  })

/** Маягтын утга (input) — бүгд string, `service` нь сонгогдоогүй үед undefined. */
export type RequestFormValues = z.input<typeof requestSchema>
/** Шалгагдсан, цэвэрлэгдсэн утга — `submitRequest()`-д дамжина. */
export type RequestInput = z.output<typeof requestSchema>
