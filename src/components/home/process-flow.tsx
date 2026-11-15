import Link from "next/link"
import { ArrowDown, ArrowRight, ArrowUp, FileText, Flag, Play } from "lucide-react"

import { SectionHeading } from "@/components/shared/section-heading"
import { homeSections } from "@/content/home"
import { flowLabels, flowStages } from "@/content/process"
import { cn } from "@/lib/utils"
import type { FlowStage } from "@/types/content"

const isService = (stage: FlowStage) => stage.id !== "intro" && stage.id !== "report"

const cardHover =
  "transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/60 group-hover:shadow-lg group-hover:shadow-primary/10 group-focus-visible:border-primary"
const iconHover =
  "transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:bg-primary group-focus-visible:text-primary-foreground"
const linkBase =
  "group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function Terminal({ kind }: { kind: "start" | "end" }) {
  const Icon = kind === "start" ? Play : Flag
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary bg-background px-3.5 py-1 text-xs font-semibold text-primary">
      <Icon className="size-3.5" aria-hidden />
      {kind === "start" ? flowLabels.start : flowLabels.end}
    </span>
  )
}

function StepBadge({ index }: { index: number }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
      {index + 1}
    </span>
  )
}

/** Баримтын хэлбэр (диаграмм дээрх долгионтой ёроолтой хуудас) */
function DocumentCard({ stage, className }: { stage: FlowStage; className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-t-lg border border-b-0 border-dashed border-primary/40 bg-accent/40 px-3 pt-3 pb-5 dark:bg-accent/25",
        className
      )}
    >
      <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide text-primary uppercase">
        <FileText className="size-3.5" aria-hidden />
        {flowLabels.document}
      </span>
      <span className="mt-1 block text-sm leading-snug font-medium">{stage.document}</span>
      <svg
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-2 h-2.5 w-full"
      >
        <path
          d="M0 0v5c12 6 25 6 37 1s25-6 38-1 19 4 25 2V0Z"
          className="fill-accent/40 dark:fill-accent/25"
        />
        <path
          d="M0 5c12 6 25 6 37 1s25-6 38-1 19 4 25 2"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="4 3"
          className="fill-none stroke-primary/40"
        />
      </svg>
    </div>
  )
}

/** Desktop (lg+): диаграммын 5 баганыг хэвтээ сумаар холбоно. */
function HorizontalFlow() {
  return (
    <ol className="hidden grid-cols-5 gap-6 lg:grid">
      {flowStages.map((stage, index) => {
        const Icon = stage.icon
        const last = index === flowStages.length - 1
        return (
          <li key={stage.id} className="flex flex-col">
            {/* Дээд тэмдэглэгээ: Эхлэх / Дэлгэрэнгүй процесс / Дуусах */}
            <div className="flex h-10 items-end justify-center">
              {index === 0 && <Terminal kind="start" />}
              {last && <Terminal kind="end" />}
              {isService(stage) && (
                <span className="rounded-full border border-dashed border-primary/50 px-3 py-1 text-[0.7rem] font-medium text-muted-foreground">
                  {flowLabels.detailedProcess}
                </span>
              )}
            </div>
            <div className="flex h-8 items-center justify-center text-primary/60" aria-hidden>
              {index === 0 ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />}
            </div>

            <Link href={stage.href} className={cn(linkBase, "flex flex-1 flex-col")}>
              <div className={cn("relative flex h-48 flex-col gap-3 rounded-xl border bg-card p-4 xl:h-44", cardHover)}>
                <div className="flex items-center justify-between">
                  <StepBadge index={index} />
                  <span className={cn("flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary", iconHover)}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                </div>
                <span className="text-xs font-semibold tracking-wide text-primary uppercase">{stage.lane}</span>
                <span className="font-heading leading-snug font-semibold text-balance">{stage.action}</span>
                {!last && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-full flex w-6 -translate-y-1/2 items-center text-primary"
                  >
                    <span className="h-0.5 flex-1 bg-primary/60" />
                    <ArrowRight className="-ml-1.5 size-4" />
                  </span>
                )}
              </div>
              <div className="mx-auto h-6 border-l-2 border-dashed border-primary/40" aria-hidden />
              <DocumentCard stage={stage} className={cn("flex-1", cardHover)} />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

/** Mobile/tablet (< lg): босоо timeline. */
function VerticalFlow() {
  return (
    <div className="lg:hidden">
      <div className="flex">
        <span className="flex w-10 shrink-0 justify-center">
          <span className="size-3 translate-y-2 rounded-full bg-primary" aria-hidden />
        </span>
        <Terminal kind="start" />
      </div>
      <ol className="relative mt-2 flex flex-col gap-4 before:absolute before:top-0 before:bottom-0 before:left-5 before:-translate-x-1/2 before:border-l-2 before:border-primary/30">
        {flowStages.map((stage, index) => {
          const Icon = stage.icon
          return (
            <li key={stage.id} className="relative flex gap-3 pt-2">
              <span className="relative z-10 flex w-10 shrink-0 justify-center">
                <StepBadge index={index} />
              </span>
              <Link href={stage.href} className={cn(linkBase, "min-w-0 flex-1")}>
                <div className={cn("flex flex-col gap-3 rounded-xl border bg-card p-4", cardHover)}>
                  <div className="flex items-start gap-3">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", iconHover)}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs font-semibold tracking-wide text-primary uppercase">{stage.lane}</span>
                      <span className="font-heading leading-snug font-semibold">{stage.action}</span>
                    </span>
                    <ArrowRight className="ml-auto size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                  </div>
                  <DocumentCard stage={stage} />
                  {isService(stage) && (
                    <span className="text-xs text-muted-foreground">+ {flowLabels.detailedProcess}</span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
      <div className="mt-4 flex">
        <span className="flex w-10 shrink-0 justify-center">
          <span className="size-3 translate-y-2 rounded-full bg-primary" aria-hidden />
        </span>
        <Terminal kind="end" />
      </div>
    </div>
  )
}

/** Зөвхөн диаграмм (гарчиггүй) — /services зэрэг хуудсанд шууд суулгаж болно. */
export function ProcessFlowDiagram({ className }: { className?: string }) {
  return (
    <div className={className}>
      <HorizontalFlow />
      <VerticalFlow />
    </div>
  )
}

interface ProcessFlowProps {
  eyebrow?: string
  title?: string
  highlight?: string
  description?: string
  className?: string
}

/** docs/brief/process-diagram.png-ийн интерактив хувилбар, гарчигтай section. */
export function ProcessFlow({
  eyebrow = homeSections.process.eyebrow,
  title = homeSections.process.title,
  highlight = homeSections.process.highlight,
  description = homeSections.process.description,
  className,
}: ProcessFlowProps) {
  return (
    <section id="process" className={cn("scroll-mt-16 py-20 md:py-28", className)}>
      <div className="container flex flex-col gap-12">
        <SectionHeading eyebrow={eyebrow} title={title} highlight={highlight} description={description} />
        <ProcessFlowDiagram />
      </div>
    </section>
  )
}
