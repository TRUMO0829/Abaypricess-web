"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList, Loader2, Send } from "lucide-react"

import { QuestionField } from "@/components/assessment/question-field"
import { RespondentStep, type RespondentErrors } from "@/components/assessment/respondent-step"
import { Button } from "@/components/ui/button"
import { assessment as defaultAssessment, type assessmentPage } from "@/content/assessment"
import { submitAssessment } from "@/lib/assessment/actions"
import { fill } from "@/lib/format"
import { respondentSchema, type RespondentFormValues } from "@/lib/assessment/schema"
import { isValidAnswer, missingRequired } from "@/lib/assessment/scoring"
import { cn } from "@/lib/utils"
import type { AnswerValue, Answers, Assessment } from "@/types/assessment"

// Бүтэц (асуултын id, тоо, оноо) кодоос; админ зөвхөн текстийг засдаг тул props-ийн текстээр харуулна
const DRAFT_KEY = `adapt-assessment-draft:${defaultAssessment.version}`
const sections = defaultAssessment.sections
const questionsById = new Map(sections.flatMap((section) => section.questions.map((q) => [q.id, q] as const)))
const totalQuestions = questionsById.size
/** Асуултын дугаар бүх бүлэгт үргэлжилнэ: бүлэг бүрийн эхний дугаар */
const sectionOffsets = sections.map((_, i) => sections.slice(0, i).reduce((sum, s) => sum + s.questions.length, 0))

/** 0 = байгууллагын мэдээлэл, 1..N = бүлгүүд, N+1 = шалгаж илгээх */
const REVIEW_STEP = sections.length + 1
const stepCount = sections.length + 2

interface Draft {
  respondent: RespondentFormValues
  answers: Answers
  step: number
}

const emptyRespondent: RespondentFormValues = {
  organization: "",
  industry: "",
  employees: "",
  name: "",
  position: "",
  email: "",
  phone: "",
}

/* ── localStorage ноорог (хувийн горим, хаагдсан storage-д ч эвдрэхгүй) ───────── */

function readDraftRaw(): string | null {
  try {
    return window.localStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null
  try {
    const draft = JSON.parse(raw) as Partial<Draft>
    return {
      respondent: { ...emptyRespondent, ...draft.respondent },
      answers: draft.answers && typeof draft.answers === "object" ? draft.answers : {},
      step: Math.min(Math.max(Number(draft.step) || 0, 0), REVIEW_STEP),
    }
  } catch {
    return null
  }
}

function writeDraft(draft: Draft | null) {
  try {
    if (draft) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    else window.localStorage.removeItem(DRAFT_KEY)
  } catch {
    // storage хаалттай бол ноорог хадгалахгүй
  }
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

/* ── Component ────────────────────────────────────────────────────────────────── */

type Phase = "intro" | "filling" | "done"

export function AssessmentWizard({ assessment, t }: { assessment: Assessment; t: typeof assessmentPage }) {
  // Текст нь админы засвартай хувилбар (бүтэц нь module-level `sections`-тэй ижил)
  const sections = assessment.sections
  const savedDraft = useSyncExternalStore(subscribeStorage, readDraftRaw, () => null)
  const [phase, setPhase] = useState<Phase>("intro")
  const [step, setStep] = useState(0)
  const [respondent, setRespondent] = useState<RespondentFormValues>(emptyRespondent)
  const [respondentErrors, setRespondentErrors] = useState<RespondentErrors>({})
  const [answers, setAnswers] = useState<Answers>({})
  const [invalidIds, setInvalidIds] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const pendingScroll = useRef<string | null>(null)

  // Ноорог хадгалах
  useEffect(() => {
    if (phase === "filling") writeDraft({ respondent, answers, step })
  }, [phase, respondent, answers, step])

  // Алхам солигдоход гарчиг (эсвэл эхний алдаатай асуулт) руу шилжинэ
  useEffect(() => {
    if (phase !== "filling") return
    const target = pendingScroll.current ? document.getElementById(pendingScroll.current) : null
    pendingScroll.current = null
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
      target.querySelector<HTMLInputElement>("input, textarea")?.focus({ preventScroll: true })
    } else {
      headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      headingRef.current?.focus({ preventScroll: true })
    }
  }, [phase, step])

  const answeredCount = Object.entries(answers).filter(([id, value]) => {
    const question = questionsById.get(id)
    return question ? isValidAnswer(question, value) : false
  }).length

  function start(draft: Draft | null) {
    setRespondent(draft?.respondent ?? emptyRespondent)
    setAnswers(draft?.answers ?? {})
    setStep(draft?.step ?? 0)
    setRespondentErrors({})
    setInvalidIds(new Set())
    setError(null)
    if (!draft) writeDraft(null)
    setPhase("filling")
  }

  function goTo(next: number, scrollTo?: string) {
    pendingScroll.current = scrollTo ?? null
    setError(null)
    setStep(next)
  }

  function validateRespondent(): boolean {
    const parsed = respondentSchema.safeParse(respondent)
    if (parsed.success) {
      setRespondentErrors({})
      return true
    }
    const errors: RespondentErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof RespondentErrors
      errors[key] ??= issue.message
    }
    setRespondentErrors(errors)
    return false
  }

  /** Бүлгийн заавал асуултыг шалгаад, дутуу бол тэмдэглэж эхнийх рүү нь гүйлгэнэ. */
  function validateSection(index: number): boolean {
    const missing = missingRequired(sections[index], answers)
    setInvalidIds((prev) => {
      const next = new Set(prev)
      for (const q of sections[index].questions) next.delete(q.id)
      for (const q of missing) next.add(q.id)
      return next
    })
    if (missing.length) {
      document.getElementById(`q-${missing[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
      return false
    }
    return true
  }

  function next() {
    if (step === 0 && !validateRespondent()) {
      headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    if (step >= 1 && step <= sections.length && !validateSection(step - 1)) return
    goTo(step + 1)
  }

  function setAnswer(id: string, value: AnswerValue | undefined) {
    setAnswers((prev) => {
      const nextAnswers = { ...prev }
      if (value === undefined) delete nextAnswers[id]
      else nextAnswers[id] = value
      return nextAnswers
    })
    if (value !== undefined && invalidIds.has(id)) {
      setInvalidIds((prev) => {
        const nextIds = new Set(prev)
        nextIds.delete(id)
        return nextIds
      })
    }
  }

  async function submit(form: HTMLFormElement) {
    if (!validateRespondent()) return goTo(0)
    const firstMissing = sections.findIndex((section) => missingRequired(section, answers).length > 0)
    if (firstMissing >= 0) {
      const missing = missingRequired(sections[firstMissing], answers)
      setInvalidIds(new Set(missing.map((q) => q.id)))
      return goTo(firstMissing + 1, `q-${missing[0].id}`)
    }

    setSubmitting(true)
    setError(null)
    const honeypot = String(new FormData(form).get("website") ?? "")
    try {
      const result = await submitAssessment({ respondent, answers }, honeypot)
      if (result.status === "submitted") {
        writeDraft(null)
        setPhase("done")
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setError(result.message)
      }
    } catch {
      setError(t.error.title)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Эхлэл ── */
  if (phase === "intro") {
    const draft = parseDraft(savedDraft)
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-bold">{t.intro.title}</h2>
            <p className="text-sm text-muted-foreground">
              {fill(t.intro.summary, { sections: sections.length, questions: totalQuestions })}
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2">
          {t.intro.points.map((point) => (
            <li key={point} className="flex gap-2 text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
        <ol className="grid gap-2 sm:grid-cols-2">
          {sections.map((section, i) => (
            <li key={section.id} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {i + 1}
              </span>
              <span className="flex-1">{section.title}</span>
              <span className="text-muted-foreground tabular-nums">{section.questions.length}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          {draft ? (
            <>
              <Button size="lg" onClick={() => start(draft)}>
                {t.buttons.resume}
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Button>
              <Button size="lg" variant="outline" onClick={() => start(null)}>
                {t.buttons.restart}
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={() => start(null)}>
              {t.buttons.start}
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    )
  }

  /* ── Амжилттай ── */
  if (phase === "done") {
    return (
      <div
        role="status"
        className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-xl bg-card p-8 ring-1 ring-foreground/10"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <h2 className="text-2xl font-bold">{t.success.title}</h2>
        <p className="text-muted-foreground">{t.success.description}</p>
        <Button variant="outline" onClick={() => start(null)}>
          {t.success.again}
        </Button>
      </div>
    )
  }

  /* ── Бөглөх ── */
  const stepTitles = [t.respondent.title, ...sections.map((s) => s.title), t.review.title]
  const section = step >= 1 && step <= sections.length ? sections[step - 1] : null
  const progress = Math.round((answeredCount / totalQuestions) * 100)

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (step === REVIEW_STEP) void submit(event.currentTarget)
        else next()
      }}
      className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10"
    >
      {/* Ботод зориулсан нуугдмал талбар */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {/* Бүлгийн цэс */}
      <nav aria-label={t.sectionsNav} className="hidden lg:block">
        <ol className="sticky top-24 flex flex-col gap-1">
          {stepTitles.map((title, i) => {
            const s = i >= 1 && i <= sections.length ? sections[i - 1] : null
            const done = s ? s.questions.filter((q) => isValidAnswer(q, answers[q.id])).length : null
            return (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-muted",
                    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    i === step && "bg-primary/10 font-semibold text-primary"
                  )}
                >
                  <span className="flex-1">{title}</span>
                  {s && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {done}/{s.questions.length}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="flex min-w-0 flex-col gap-6">
        {/* Явц */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>{fill(t.step, { current: step + 1, total: stepCount })}</span>
            <span className="tabular-nums">{fill(t.progress, { answered: answeredCount, total: totalQuestions })}</span>
          </div>
          <div
            role="progressbar"
            aria-label={fill(t.progress, { answered: answeredCount, total: totalQuestions })}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 ref={headingRef} tabIndex={-1} className="scroll-mt-24 text-2xl font-bold outline-none">
            {stepTitles[step]}
          </h2>
          <p className="text-muted-foreground">
            {step === 0 ? t.respondent.description : step === REVIEW_STEP ? t.review.description : section?.description}
          </p>
        </div>

        {step === 0 && <RespondentStep t={t} values={respondent} errors={respondentErrors} onChange={setRespondent} />}

        {section && (
          <div className="flex flex-col gap-4">
            {section.questions.map((question, i) => (
              <QuestionField
                t={t}
                key={question.id}
                question={question}
                number={sectionOffsets[step - 1] + i + 1}
                value={answers[question.id]}
                onChange={(value) => setAnswer(question.id, value)}
                invalid={invalidIds.has(question.id)}
              />
            ))}
            {section.questions.some((q) => invalidIds.has(q.id)) && (
              <p className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                {fill(t.missing, { count: section.questions.filter((q) => invalidIds.has(q.id)).length })}
              </p>
            )}
          </div>
        )}

        {step === REVIEW_STEP && (
          <ul className="flex flex-col divide-y rounded-xl border bg-card">
            <li className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium">{t.respondent.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {[respondent.organization, respondent.name, respondent.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => goTo(0)}>
                {t.review.edit}
              </Button>
            </li>
            {sections.map((s, i) => {
              const missing = missingRequired(s, answers).length
              const done = s.questions.filter((q) => isValidAnswer(q, answers[q.id])).length
              return (
                <li key={s.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{s.title}</p>
                    <p className={cn("text-sm", missing ? "text-destructive" : "text-muted-foreground")}>
                      {done}/{s.questions.length}
                      {missing > 0 && ` · ${fill(t.missing, { count: missing })}`}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => goTo(i + 1)}>
                    {t.review.edit}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}

        {error && (
          <div role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {t.error.title}
            </p>
            <p className="mt-1.5 text-muted-foreground">
              {error} {t.error.description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => goTo(step - 1)} disabled={step === 0 || submitting}>
            <ArrowLeft data-icon="inline-start" aria-hidden />
            {t.buttons.back}
          </Button>
          {step === REVIEW_STEP ? (
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />
                  {t.buttons.submitting}
                </>
              ) : (
                <>
                  <Send data-icon="inline-start" aria-hidden />
                  {t.buttons.submit}
                </>
              )}
            </Button>
          ) : (
            <Button type="submit">
              {t.buttons.next}
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
