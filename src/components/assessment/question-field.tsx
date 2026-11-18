"use client"

import type { ReactNode } from "react"
import { AlertCircle } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { assessmentPage as t } from "@/content/assessment"
import { isRequired, TEXT_ANSWER_MAX } from "@/lib/assessment/scoring"
import { cn } from "@/lib/utils"
import type { AnswerValue, AssessmentQuestion } from "@/types/assessment"

interface ChipProps {
  name: string
  checked: boolean
  onSelect: () => void
  className?: string
  children: ReactNode
}

/** Товч хэлбэртэй radio — гарын сумаар шилжинэ, дэлгэц уншигчид radio гэж уншигдана. */
function Chip({ name, checked, onSelect, className, children }: ChipProps) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-center justify-center rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors",
        "hover:border-primary/50 has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground",
        "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        className
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="absolute inset-0 cursor-pointer appearance-none rounded-lg opacity-0"
      />
      {children}
    </label>
  )
}

interface QuestionFieldProps {
  question: AssessmentQuestion
  number: number
  value: AnswerValue | undefined
  onChange: (value: AnswerValue | undefined) => void
  invalid?: boolean
}

export function QuestionField({ question, number, value, onChange, invalid }: QuestionFieldProps) {
  const name = `q-${question.id}`
  const required = isRequired(question)
  const hintId = question.hint ? `${name}-hint` : undefined
  const errorId = invalid ? `${name}-error` : undefined

  return (
    <fieldset
      id={name}
      data-invalid={invalid || undefined}
      aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
      className="flex min-w-0 scroll-mt-24 flex-col gap-3 rounded-xl border bg-card p-5 data-invalid:border-destructive"
    >
      <legend className="sr-only">
        {number}. {question.text}
      </legend>
      <p aria-hidden className="flex gap-2 font-medium">
        <span className="shrink-0 text-primary tabular-nums">{number}.</span>
        <span>
          {question.text}{" "}
          {required ? (
            <span className="text-destructive">*</span>
          ) : (
            <span className="font-normal text-muted-foreground">{t.optional}</span>
          )}
        </span>
      </p>
      {question.hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {question.hint}
        </p>
      )}

      {question.type === "scale" && (
        <div className="flex flex-col gap-2">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(question.max - question.min + 1, 6)}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: question.max - question.min + 1 }, (_, i) => question.min + i).map((n) => (
              <Chip key={n} name={name} checked={value === n} onSelect={() => onChange(n)}>
                {n}
              </Chip>
            ))}
          </div>
          {(question.minLabel || question.maxLabel) && (
            <div className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span>
                {question.min} — {question.minLabel}
              </span>
              <span className="text-end">
                {question.max} — {question.maxLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {question.type === "yesno" && (
        <div className="grid max-w-xs grid-cols-2 gap-2">
          <Chip name={name} checked={value === true} onSelect={() => onChange(true)}>
            {t.yes}
          </Chip>
          <Chip name={name} checked={value === false} onSelect={() => onChange(false)}>
            {t.no}
          </Chip>
        </div>
      )}

      {question.type === "choice" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options.map((option, index) => (
            <Chip
              key={option.label}
              name={name}
              checked={value === index}
              onSelect={() => onChange(index)}
              className="justify-start text-start"
            >
              {option.label}
            </Chip>
          ))}
        </div>
      )}

      {question.type === "text" && (
        <Textarea
          aria-label={question.text}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value || undefined)}
          placeholder={question.placeholder}
          maxLength={TEXT_ANSWER_MAX}
          rows={4}
        />
      )}

      {invalid && (
        <p id={errorId} className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {t.answerRequired}
        </p>
      )}
    </fieldset>
  )
}
