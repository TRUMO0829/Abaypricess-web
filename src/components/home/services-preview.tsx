import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { homeSections } from "@/content/home"
import { services } from "@/content/services"

const t = homeSections.services

export function ServicesPreview() {
  return (
    <section id="services" className="scroll-mt-16 border-y bg-muted/40 py-20 md:py-28">
      <div className="container flex flex-col gap-12">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description} />
        <ul className="grid gap-6 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-6 transition-all outline-none hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span
                    aria-hidden
                    className="absolute -top-4 -right-1 font-heading text-8xl font-bold text-primary/5 select-none"
                  >
                    0{service.order}
                  </span>
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-wide text-primary uppercase">{service.nameEn}</span>
                    <h3 className="text-xl font-semibold text-balance">{service.name}</h3>
                  </span>
                  <p className="text-sm text-pretty text-muted-foreground">{service.shortDescription}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                    {t.more}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">{t.all}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
