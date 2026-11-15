"use client"

import { useId, useRef, useState, type KeyboardEvent } from "react"
import { Check, ChevronDown, ChevronLeft, ChevronRight, Clock, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ProcessStep } from "@/types/content"

interface ProcessStepperProps {
  steps: ProcessStep[]
  /** Tablist-ийн хүртээмжийн нэр */
  label: string
}

/** Сум, Home/End товчоор жагсаалтын дотор шилжих индексийг буцаана. */
function nextIndex(key: string, current: number, length: number, keys: [string, string]) {
  if (key === keys[0]) return (current - 1 + length) % length
  if (key === keys[1]) return (current + 1) % length
  if (key === "Home") return 0
  if (key === "End") return length - 1
  return null
}

function StepMeta({ step, className }: { step: ProcessStep; className?: string }) {
  if (!step.duration && !step.deliverable) return null
  return (
    <dl className={cn("flex flex-wrap gap-2 text-xs", className)}>
      {step.duration && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          <dt className="sr-only">Хугацаа</dt>
          <dd>{step.duration}</dd>
        </div>
      )}
      {step.deliverable && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
          <FileText className="size-3.5 shrink-0" aria-hidden />
          <dt className="sr-only">Үр дүн</dt>
          <dd>{step.deliverable}</dd>
        </div>
      )}
    </dl>
  )
}

function StepDetails({ details }: { details: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {details.map((detail) => (
        <li key={detail} className="flex items-start gap-2.5 text-sm">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>{detail}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Үйлчилгээний дэлгэрэнгүй процесс.
 * Desktop (md+): хэвтээ step indicator (WAI-ARIA tabs) + сонгосон алхмын panel.
 * Mobile: босоо timeline, алхам бүр задардаг (disclosure).
 */
export function ProcessStepper({ steps, label }: ProcessStepperProps) {
  const baseId = useId()
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(steps[0] ? [steps[0].id] : []))
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const toggleRefs = useRef<(HTMLButtonElement | null)[]>([])

  const current = steps[active]
  if (!current) return null

  const tabId = (i: number) => `${baseId}-tab-${i}`
  const panelId = `${baseId}-panel`

  function selectTab(index: number, focus = false) {
    setActive(index)
    if (focus) tabRefs.current[index]?.focus()
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const target = nextIndex(event.key, index, steps.length, ["ArrowLeft", "ArrowRight"])
    if (target === null) return
    event.preventDefault()
    selectTab(target, true)
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function onToggleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const target = nextIndex(event.key, index, steps.length, ["ArrowUp", "ArrowDown"])
    if (target === null) return
    event.preventDefault()
    toggleRefs.current[target]?.focus()
  }

  return (
    <div>
      {/* Desktop: хэвтээ step indicator */}
      <div className="hidden md:block">
        <div
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          className="grid"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        >
          {steps.map((step, i) => {
            const selected = i === active
            const done = i < active
            return (
              <div key={step.id} className="relative flex justify-center px-2">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-6 right-[calc(-50%+1.75rem)] left-[calc(50%+1.75rem)] h-0.5 overflow-hidden rounded-full bg-border"
                  >
                    <span
                      className={cn(
                        "block h-full origin-left bg-primary transition-transform duration-300 motion-reduce:transition-none",
                        done ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </span>
                )}
                <button
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={tabId(i)}
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectTab(i)}
                  onKeyDown={(event) => onTabKeyDown(event, i)}
                  className="group flex flex-col items-center gap-3 rounded-lg p-2 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full border-2 font-heading text-base font-bold transition-colors",
                      selected && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                      done && "border-primary bg-background text-primary",
                      !selected && !done && "border-border bg-background text-muted-foreground group-hover:border-primary/50 group-hover:text-foreground"
                    )}
                  >
                    {done ? <Check className="size-5" aria-hidden /> : i + 1}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "text-sm leading-snug font-semibold text-balance",
                        selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                    {step.duration && <span className="text-xs text-muted-foreground">{step.duration}</span>}
                    {step.deliverable && (
                      <span className="inline-flex items-center justify-center gap-1 text-xs font-medium text-primary">
                        <FileText className="size-3" aria-hidden />
                        Баримттай
                      </span>
                    )}
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(active)}
          tabIndex={0}
          className="mt-8 rounded-xl bg-card p-8 ring-1 ring-foreground/10 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">
                Алхам {active + 1} / {steps.length}
              </span>
              <h3 className="text-2xl font-bold">{current.title}</h3>
              <p className="text-muted-foreground">{current.summary}</p>
              <StepDetails details={current.details} />
            </div>

            {(current.duration || current.deliverable) && (
              <dl className="flex flex-col gap-4 self-start rounded-lg bg-muted/60 p-5 md:flex-row lg:flex-col">
                {current.duration && (
                  <div className="flex flex-1 items-start gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    <div>
                      <dt className="text-xs text-muted-foreground">Хугацаа</dt>
                      <dd className="font-semibold">{current.duration}</dd>
                    </div>
                  </div>
                )}
                {current.deliverable && (
                  <div className="flex flex-1 items-start gap-3">
                    <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    <div>
                      <dt className="text-xs text-muted-foreground">Хүлээлгэн өгөх үр дүн</dt>
                      <dd className="font-semibold">{current.deliverable}</dd>
                    </div>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t pt-6">
            <Button variant="ghost" onClick={() => selectTab(active - 1)} disabled={active === 0}>
              <ChevronLeft data-icon="inline-start" aria-hidden />
              Өмнөх алхам
            </Button>
            <Button
              variant="outline"
              onClick={() => selectTab(active + 1)}
              disabled={active === steps.length - 1}
            >
              Дараагийн алхам
              <ChevronRight data-icon="inline-end" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile: босоо timeline */}
      <ol className="md:hidden" aria-label={label}>
        {steps.map((step, i) => {
          const open = expanded.has(step.id)
          const detailsId = `${baseId}-details-${i}`
          return (
            <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute top-12 bottom-2 left-5 w-0.5 -translate-x-1/2 rounded-full bg-border" />
              )}
              <span
                aria-hidden
                className={cn(
                  "relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-heading text-sm font-bold transition-colors",
                  open ? "border-primary bg-primary text-primary-foreground" : "border-primary/40 bg-background text-primary"
                )}
              >
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1.5">
                <h3>
                  <button
                    ref={(el) => {
                      toggleRefs.current[i] = el
                    }}
                    type="button"
                    aria-expanded={open}
                    aria-controls={detailsId}
                    onClick={() => toggle(step.id)}
                    onKeyDown={(event) => onToggleKeyDown(event, i)}
                    className="flex w-full items-start justify-between gap-3 rounded-md text-start text-base leading-snug font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span>
                      <span className="sr-only">Алхам {i + 1}: </span>
                      {step.title}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                </h3>
                <p className="text-sm text-muted-foreground">{step.summary}</p>
                <StepMeta step={step} />
                <div id={detailsId} hidden={!open} className="mt-2 rounded-lg bg-muted/60 p-4">
                  <StepDetails details={step.details} />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
