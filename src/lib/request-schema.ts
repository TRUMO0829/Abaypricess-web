import { z } from "zod"

export const requestSchema = z.object({
  name: z.string().trim().min(2, { error: "Овог нэрээ оруулна уу" }),
  organization: z.string().trim().min(2, { error: "Байгууллагын нэрээ оруулна уу" }),
  position: z.string().trim().optional(),
  email: z.email({ error: "Имэйл хаяг буруу байна" }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?976)?[\s-]?\d{4}[\s-]?\d{4}$/, { error: "Утасны дугаар 8 оронтой байна" }),
  service: z.enum(["training", "laboratory", "update", "other"], {
    error: "Үйлчилгээгээ сонгоно уу",
  }),
  packageId: z.string().optional(),
  message: z.string().trim().max(2000, { error: "2000 тэмдэгтээс хэтрэхгүй" }).optional(),
})

export type RequestInput = z.infer<typeof requestSchema>
