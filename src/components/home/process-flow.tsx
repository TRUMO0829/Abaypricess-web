import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"

import { SectionHeading } from "@/components/shared/section-heading"
import { homeSections } from "@/content/home"
import { flowLabels, flowStages } from "@/content/process"
import { cn } from "@/lib/utils"
import type { FlowStage } from "@/types/content"

const cardHover =
  "transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/60 group-hover:shadow-lg group-hover:shadow-primary/10 group-focus-visible:border-primary"
const iconHover =
  "transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:bg-primary group-focus-visible:text-primary-foreground"
const linkBase =
  "group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

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

/** Desktop (lg+): 3 үйлчилгээг баганаар, доор нь хүлээлгэн өгөх баримт. */
function HorizontalFlow() {
  return (
    <ol className="hidden grid-cols-3 gap-6 lg:grid">
      {flowStages.map((stage) => {
        const Icon = stage.icon
        return (
          <li key={stage.id} className="flex flex-col">
            <Link href={stage.href} className={cn(linkBase, "flex flex-1 flex-col")}>
              <div className={cn("flex flex-col gap-3 rounded-xl border bg-card p-5", cardHover)}>
                <span className={cn("flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary", iconHover)}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-xs font-semibold tracking-wide text-primary uppercase">{stage.lane}</span>
                <span className="font-heading leading-snug font-semibold text-balance">{stage.action}</span>
              </div>
              <DocumentCard stage={stage} className={cn("mt-4 flex-1", cardHover)} />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

/** Mobile/tablet (< lg): босоо жагсаалт. */
function VerticalFlow() {
  return (
    <ol className="flex flex-col gap-4 lg:hidden">
      {flowStages.map((stage) => {
        const Icon = stage.icon
        return (
          <li key={stage.id}>
            <Link href={stage.href} className={linkBase}>
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
              </div>
            </Link>
          </li>
        )
      })}
    </ol>
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

/** Үндсэн 3 үйлчилгээний диаграмм, гарчигтай section. */
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
