"use server"

import { headers } from "next/headers"

import { assessment } from "@/content/assessment"
import { notifyNewSubmission } from "@/lib/assessment/notify"
import { parseAnswers, respondentSchema } from "@/lib/assessment/schema"
import { answerLabel, normalizedScore, questionWeight, scoreAssessment } from "@/lib/assessment/scoring"
import { getSubmissionStore, toRecord } from "@/lib/assessment/store"

export type AssessmentResult =
  | { status: "submitted" }
  | { status: "invalid"; message: string; missing?: string[] }
  | { status: "error"; message: string }

const RATE_LIMIT = { max: 3, windowMs: 10 * 60_000 }
const rateStore = globalThis as typeof globalThis & { __adaptAssessmentRate?: Map<string, number[]> }

/** IP тус бүрээс 10 минутад 3-аас олон үнэлгээ хүлээж авахгүй (процессын санах ойд). */
async function rateLimited(): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  rateStore.__adaptAssessmentRate ??= new Map()
  const recent = (rateStore.__adaptAssessmentRate.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  if (recent.length >= RATE_LIMIT.max) return true
  rateStore.__adaptAssessmentRate.set(ip, [...recent, now])
  return false
}

/**
 * Үнэлгээг сервер дээр дахин шалгаж, оноог асуулгын тодорхойлолтоос тооцоод хадгална.
 * Client-ээс ирсэн оноонд итгэхгүй — зөвхөн хариултыг хүлээн авна.
 */
export async function submitAssessment(
  input: { respondent: unknown; answers: unknown },
  honeypot?: string
): Promise<AssessmentResult> {
  const generic = "Үнэлгээг хадгалах үед алдаа гарлаа."
  if (honeypot) return { status: "error", message: generic }

  const respondent = respondentSchema.safeParse(input.respondent)
  if (!respondent.success) return { status: "invalid", message: "Байгууллагын мэдээлэл дутуу эсвэл буруу байна." }

  const parsed = parseAnswers(input.answers)
  if (!parsed.ok) {
    return { status: "invalid", message: "Заавал асуултад бүрэн хариулна уу.", missing: parsed.missing }
  }

  const store = getSubmissionStore()
  if (!store) return { status: "error", message: "Үнэлгээ хүлээн авах боломж түр хаалттай байна." }

  if (store.kind === "supabase" && (await rateLimited())) {
    return { status: "error", message: "Хэт олон оролдлого хийгдлээ. Хэсэг хугацааны дараа дахин оролдоно уу." }
  }

  const { answers } = parsed
  const record = toRecord(
    crypto.randomUUID(),
    assessment.version,
    respondent.data,
    scoreAssessment(assessment, answers),
    assessment.sections.flatMap((section) =>
      section.questions
        .filter((question) => answers[question.id] !== undefined)
        .map((question) => ({
          id: question.id,
          section: section.title,
          question: question.text,
          answer: answerLabel(question, answers[question.id]),
          score: normalizedScore(question, answers[question.id]),
          weight: questionWeight(question),
        }))
    )
  )

  try {
    await store.insert(record)
  } catch (error) {
    console.error("[assessment] store", error)
    return { status: "error", message: generic }
  }

  // Мэдэгдэл амжилтгүй болсон ч үнэлгээ хадгалагдсан тул хэрэглэгчид амжилттай гэж харуулна
  await notifyNewSubmission(record)
  return { status: "submitted" }
}
