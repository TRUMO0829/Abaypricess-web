import { z } from "zod"

import { assessment, assessmentPage } from "@/content/assessment"
import { allQuestions, isRequired, isValidAnswer } from "@/lib/assessment/scoring"
import { MN_PHONE_REGEX } from "@/lib/request-schema"
import type { Answers, Assessment } from "@/types/assessment"

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `${max} тэмдэгтээс хэтрэхгүй` })
    .optional()
    .transform((value) => (value ? value : undefined))

export const employeeOptions = assessmentPage.respondent.employeeOptions as [string, ...string[]]

export const respondentSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, { error: "Байгууллагын нэрээ оруулна уу" })
    .min(2, { error: "Байгууллагын нэр хэт богино байна" })
    .max(150, { error: "150 тэмдэгтээс хэтрэхгүй" }),
  industry: optionalText(100),
  employees: z.enum(employeeOptions, { error: "Ажилтны тоогоо сонгоно уу" }),
  name: z
    .string()
    .trim()
    .min(1, { error: "Нэрээ оруулна уу" })
    .min(2, { error: "Нэр хэт богино байна" })
    .max(100, { error: "100 тэмдэгтээс хэтрэхгүй" }),
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
})

export type RespondentFormValues = z.input<typeof respondentSchema>
export type Respondent = z.output<typeof respondentSchema>

/**
 * Хариултыг асуулгын тодорхойлолттой тулгана: мэдэгдэхгүй id, буруу төрлийн утгыг хасаж,
 * заавал асуулт бүгд хариулагдсан эсэхийг шалгана. Текстийг trim хийнэ.
 */
export function parseAnswers(
  input: unknown,
  definition: Assessment = assessment
): { ok: true; answers: Answers } | { ok: false; missing: string[] } {
  const raw = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {}
  const answers: Answers = {}
  const missing: string[] = []
  for (const question of allQuestions(definition)) {
    let value = raw[question.id]
    if (typeof value === "string") value = value.trim()
    if (isValidAnswer(question, value as Answers[string])) answers[question.id] = value as Answers[string]
    else if (isRequired(question)) missing.push(question.id)
  }
  return missing.length ? { ok: false, missing } : { ok: true, answers }
}
