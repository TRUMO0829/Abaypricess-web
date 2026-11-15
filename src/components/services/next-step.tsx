import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { flowStages } from "@/content/process"
import { getNextService, serviceDetailContent } from "@/content/services"
import type { ServiceSlug } from "@/types/content"

/** Диаграммын дараагийн сум: дараагийн үйлчилгээ, эсвэл Update-ийн дараа тайлан. */
export function NextStep({ slug }: { slug: ServiceSlug }) {
  const next = getNextService(slug)
  const report = flowStages.find((stage) => stage.id === "report")
  const { eyebrow, reportDescription } = serviceDetailContent.next

  const target = next
    ? {
        href: `/services/${next.slug}`,
        icon: next.icon,
        kicker: `${next.order}. ${next.nameEn}`,
        title: next.name,
        description: next.shortDescription,
      }
    : report && {
        href: report.href,
        icon: report.icon,
        kicker: report.lane,
        title: report.action,
        description: reportDescription,
      }

  if (!target) return null
  const Icon = target.icon

  return (
    <Link
      href={target.href}
      className="group flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition-shadow outline-none hover:shadow-lg hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center md:p-8"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {eyebrow} · <span className="text-primary">{target.kicker}</span>
        </span>
        <span className="font-heading text-xl font-bold">{target.title}</span>
        <span className="text-sm text-muted-foreground">{target.description}</span>
      </span>
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-1"
      >
        <ArrowRight className="size-5" />
      </span>
    </Link>
  )
}
