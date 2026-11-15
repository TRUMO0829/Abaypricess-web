import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { flowStages } from "@/content/process"
import { getStartingPrice, services, servicesPageContent } from "@/content/services"
import { formatMNT } from "@/lib/format"

const report = flowStages.find((stage) => stage.id === "report")

/** Алхмын хоорондох сум: mobile дээр доош, desktop дээр баруун тийш. md (2 багана) дээр нуугдана. */
function FlowArrow() {
  return (
    <span
      aria-hidden
      className="flex justify-center text-primary/60 md:hidden lg:absolute lg:top-1/2 lg:-right-6 lg:flex lg:-translate-y-1/2"
    >
      <ArrowDown className="size-5 lg:hidden" />
      <ArrowRight className="hidden size-5 lg:block" />
    </span>
  )
}

/** Диаграммын урсгал: Training → Laboratory → Update → Тайлан. */
export function ServicesFlow() {
  const { stepLabel, startingFrom, reportEyebrow, reportDescription } = servicesPageContent.flow

  return (
    <ol className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-12">
      {services.map((service) => {
        const Icon = service.icon
        const startingPrice = getStartingPrice(service)

        return (
          <li key={service.slug} className="relative flex flex-col gap-4 lg:gap-0">
            <article className="group relative flex h-full flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition-shadow hover:shadow-lg hover:ring-primary/40">
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="font-heading text-sm font-semibold text-muted-foreground">
                  {stepLabel} {service.order}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                  {service.nameEn}
                </span>
                <h3 className="text-lg leading-snug font-semibold">
                  <Link
                    href={`/services/${service.slug}`}
                    className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
                  >
                    {service.name}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground">{service.shortDescription}</p>
              </div>

              <div className="flex items-end justify-between gap-3 border-t pt-4">
                <p className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{startingFrom}</span>
                  <span className="font-heading text-base font-bold">{formatMNT(startingPrice)}</span>
                </p>
                <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                  Дэлгэрэнгүй
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
              {/* Карт бүхэлдээ холбоос тул focus-ийг картын хүрээгээр харуулна */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl ring-ring/50 group-has-focus-visible:ring-3"
              />
            </article>
            <FlowArrow />
          </li>
        )
      })}

      {report && (
        <li className="relative">
          <article className="group relative flex h-full flex-col gap-5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 transition-colors hover:border-primary">
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <report.icon className="size-6" aria-hidden />
              </span>
              <span className="font-heading text-sm font-semibold text-muted-foreground">{report.lane}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                {reportEyebrow}
              </span>
              <h3 className="text-lg leading-snug font-semibold">
                <Link
                  href={report.href}
                  className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
                >
                  {report.action}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">{reportDescription}</p>
            </div>
            <span className="flex items-center gap-1 border-t border-primary/20 pt-4 text-sm font-medium text-primary">
              {report.document}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-0.5 rounded-xl ring-ring/50 group-has-focus-visible:ring-3"
            />
          </article>
        </li>
      )}
    </ol>
  )
}
