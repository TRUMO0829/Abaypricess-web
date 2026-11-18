import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getStartingPrice, services, servicesPageContent } from "@/content/services"
import { formatMNT } from "@/lib/format"

/** Үндсэн 3 үйлчилгээний карт. */
export function ServicesFlow() {
  const { startingFrom } = servicesPageContent.flow

  return (
    <ul className="grid gap-4 md:gap-6 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon
        const startingPrice = getStartingPrice(service)

        return (
          <li key={service.slug} className="flex flex-col">
            <article className="group relative flex h-full flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition-shadow hover:shadow-lg hover:ring-primary/40">
              <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-6" aria-hidden />
              </span>

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
          </li>
        )
      })}

    </ul>
  )
}
