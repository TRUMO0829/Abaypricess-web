import "server-only"

import type { Respondent } from "@/lib/assessment/schema"
import type { AssessmentScore } from "@/lib/assessment/scoring"

/** Supabase-ийн `assessment_submissions` хүснэгтийн мөр (docs/ASSESSMENT.md) */
export interface SubmissionRecord {
  id: string
  assessment_version: string
  organization: string
  industry: string | null
  employees: string
  contact_name: string
  position: string | null
  email: string
  phone: string
  total_score: number | null
  section_scores: AssessmentScore["sections"]
  /** Зөвлөхүүд шууд уншихаар асуулт, хариултын текст, оноотой нь хадгална */
  answers: {
    id: string
    section: string
    question: string
    answer: string
    /** 0–1, оноогүй асуулт null */
    score: number | null
    weight: number
  }[]
}

export function toRecord(
  id: string,
  version: string,
  respondent: Respondent,
  score: AssessmentScore,
  answers: SubmissionRecord["answers"]
): SubmissionRecord {
  return {
    id,
    assessment_version: version,
    organization: respondent.organization,
    industry: respondent.industry ?? null,
    employees: respondent.employees,
    contact_name: respondent.name,
    position: respondent.position,
    email: respondent.email,
    phone: respondent.phone,
    total_score: score.total,
    section_scores: score.sections,
    answers,
  }
}

export interface SubmissionStore {
  kind: "supabase" | "mock"
  insert(record: SubmissionRecord): Promise<void>
}

/* ── Supabase (PostgREST, зөвхөн INSERT эрхтэй publishable key) ──────────────── */

function supabaseStore(url: string, key: string): SubmissionStore {
  return {
    kind: "supabase",
    async insert(record) {
      const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/assessment_submissions`, {
        method: "POST",
        headers: {
          apikey: key,
          "content-type": "application/json",
          // RLS нь anon-д зөвхөн INSERT зөвшөөрдөг тул мөрийг буцааж уншихгүй
          prefer: "return=minimal",
        },
        body: JSON.stringify(record),
        cache: "no-store",
      })
      if (!res.ok) throw new Error(`Supabase insert: ${res.status} ${await res.text()}`)
    },
  }
}

/* ── Туршилтын сан (dev, e2e) ─────────────────────────────────────────────────── */

const mockStore = globalThis as typeof globalThis & { __adaptAssessments?: SubmissionRecord[] }

const memoryStore: SubmissionStore = {
  kind: "mock",
  async insert(record) {
    mockStore.__adaptAssessments ??= []
    mockStore.__adaptAssessments.push(record)
    console.info(`[assessment] mock: ${record.organization} — ${record.total_score ?? "–"}%`)
  },
}

/**
 * `ASSESSMENT_MOCK=1` (e2e) → санах ой. Supabase env бүрэн бол Supabase. Dev горимд env байхгүй бол санах ой.
 * Production-д тохиргоогүй бол `null` — илгээх боломжгүй гэж харуулна.
 */
export function getSubmissionStore(): SubmissionStore | null {
  if (process.env.ASSESSMENT_MOCK === "1") return memoryStore
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env
  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) return supabaseStore(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  if (process.env.NODE_ENV === "development") return memoryStore
  return null
}
