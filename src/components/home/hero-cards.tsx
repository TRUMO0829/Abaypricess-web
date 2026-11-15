import Link from "next/link"
import { ArrowRight, FileCheck2 } from "lucide-react"

import { heroCards, stats } from "@/content/home"
import { flowStages } from "@/content/process"

/** Hero-гийн баруун талын corporate картууд: ажлын урсгал, статистик, тайлан. */
export function HeroCards() {
  return (
    <div className="relative grid gap-4 sm:grid-cols-2">
      <div aria-hidden className="absolute -inset-8 -z-10 rounded-full bg-primary/15 blur-3xl dark:bg-primary/10" />

      <div className="rounded-2xl border bg-card p-5 shadow-xl shadow-primary/5 sm:row-span-2">
        <p className="font-heading text-base font-semibold">{heroCards.process.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{heroCards.process.description}</p>
        <ol className="mt-5 flex flex-col">
          {flowStages.map((stage, index) => {
            const Icon = stage.icon
            const last = index === flowStages.length - 1
            return (
              <li key={stage.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!last && <span aria-hidden className="absolute top-8 bottom-0 left-4 border-l-2 border-primary/20" />}
                <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-card">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                    {index + 1}. {stage.lane}
                  </span>
                  <span className="text-sm font-medium">{stage.action}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-xl shadow-primary/5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col justify-center bg-card p-4">
            <span className="font-heading text-2xl font-bold text-primary">{stat.value}</span>
            <span className="mt-1 text-xs leading-snug text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <Link
        href={heroCards.report.href}
        className="group flex flex-col gap-3 rounded-2xl bg-primary p-5 text-primary-foreground shadow-xl shadow-primary/20 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15">
          <FileCheck2 className="size-5" aria-hidden />
        </span>
        <span className="font-heading font-semibold">{heroCards.report.title}</span>
        <span className="text-sm text-primary-foreground/80">{heroCards.report.description}</span>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium">
          {heroCards.report.cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>
    </div>
  )
}
