import { z } from "zod"

import { getService } from "@/content/services"

/** Багц сонгоогүй гэдгийг илэрхийлэх Select-ийн утга (Radix Select хоосон утга зөвшөөрдөггүй). */
export const UNDECIDED_PACKAGE = "undecided"

export const requestServiceValues = ["training", "laboratory", "update", "other"] as const

/**
 * Монгол утасны дугаар: 8 орон, эхний орон 0 биш.
 * `+976`/`976` угтвар, хоосон зай, зураас зөвшөөрнө: "99112233", "9911 2233", "+976 9911-2233".
 */
export const MN_PHONE_REGEX = /^(?:\+?976[\s-]?)?[1-9]\d{3}[\s-]?\d{4}$/

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
      .min(1, { error: "Овог нэрээ оруулна уу" })
      .min(2, { error: "Овог нэр хэт богино байна" })
      .max(100, { error: "100 тэмдэгтээс хэтрэхгүй" }),
    organization: z
      .string()
      .trim()
      .min(1, { error: "Байгууллагын нэрээ оруулна уу" })
      .min(2, { error: "Байгууллагын нэр хэт богино байна" })
      .max(150, { error: "150 тэмдэгтээс хэтрэхгүй" }),
    position: optionalText(100, "100 тэмдэгтээс хэтрэхгүй"),
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
  })
  .superRefine((data, ctx) => {
    if (!data.packageId) return
    const service = data.service === "other" ? undefined : getService(data.service)
    if (!service?.packages.some((pkg) => pkg.id === data.packageId)) {
      ctx.addIssue({ code: "custom", path: ["packageId"], message: "Сонгосон үйлчилгээнд энэ багц байхгүй" })
    }
  })

/** Маягтын утга (input) — бүгд string, `service` нь сонгогдоогүй үед undefined. */
export type RequestFormValues = z.input<typeof requestSchema>
/** Шалгагдсан, цэвэрлэгдсэн утга — `submitRequest()`-д дамжина. */
export type RequestInput = z.output<typeof requestSchema>
