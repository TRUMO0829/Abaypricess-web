import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getNextService } from "@/content/services"
import { getSiteContent } from "@/lib/content"
import type { ServiceSlug } from "@/types/content"

/** Дараагийн үйлчилгээ рүү шилжих карт. Сүүлийн үйлчилгээнд (Update) харагдахгүй. */
export async function NextStep({ slug }: { slug: ServiceSlug }) {
  const { services, serviceDetailContent } = await getSiteContent()
  const next = getNextService(slug, services)
  if (!next) return null
  const { eyebrow } = serviceDetailContent.next
  const Icon = next.icon

  return (
    <Link
      href={`/services/${next.slug}`}
      className="group flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 transition-shadow outline-none hover:shadow-lg hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center md:p-8"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </span>
        <span className="font-heading text-xl font-bold">{next.name}</span>
        <span className="text-sm text-muted-foreground">{next.shortDescription}</span>
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
