import "server-only"

import { company } from "@/content/company"
import type { SubmissionRecord } from "@/lib/assessment/store"

const formatScore = (score: number | null) => (score === null ? "–" : `${score}%`)

function buildText(record: SubmissionRecord): string {
  const lines = [
    "Вебсайтаар шинэ байгууллагын үнэлгээ ирлээ.",
    "",
    `Байгууллага: ${record.organization}`,
    record.industry ? `Чиглэл: ${record.industry}` : null,
    `Ажилтны тоо: ${record.employees}`,
    `Бөглөсөн: ${record.contact_name}${record.position ? `, ${record.position}` : ""}`,
    `Имэйл: ${record.email}`,
    `Утас: ${record.phone}`,
    "",
    `Нийт оноо: ${formatScore(record.total_score)}`,
    ...record.section_scores.map((s) => `  • ${s.title}: ${formatScore(s.score)} (${s.answered}/${s.questions} асуулт)`),
    "",
    `Дэлгэрэнгүй хариулт: Supabase → assessment_submissions, id ${record.id}`,
  ]
  return lines.filter((line): line is string => line !== null).join("\n")
}

/**
 * Adapt-ийн имэйл рүү мэдэгдэл илгээнэ (Resend REST API).
 * `RESEND_API_KEY` байхгүй бол алгасна. Алдаа гарсан ч үнэлгээ хадгалагдсан тул шидэхгүй, log-д бичнэ.
 */
export async function notifyNewSubmission(record: SubmissionRecord): Promise<"sent" | "skipped" | "failed"> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return "skipped"

  const to = (process.env.ASSESSMENT_NOTIFY_TO || company.contact.email)
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean)
  const from = process.env.ASSESSMENT_NOTIFY_FROM || `${company.nameEn} <onboarding@resend.dev>`

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        reply_to: record.email,
        subject: `Шинэ үнэлгээ: ${record.organization} — ${formatScore(record.total_score)}`,
        text: buildText(record),
      }),
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
    return "sent"
  } catch (error) {
    console.error("[assessment] notify", error)
    return "failed"
  }
}
