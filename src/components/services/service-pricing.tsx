import Link from "next/link"
import { Check, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { serviceDetailContent } from "@/content/services"
import { formatMNT } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Service } from "@/types/content"

/** Загварын Pricing.tsx-ээс port хийсэн үнийн санал. */
export function ServicePricing({ service }: { service: Service }) {
  const { popularLabel, note } = serviceDetailContent.pricing

  return (
    <div className="flex flex-col gap-8">
      <ul className="mx-auto grid w-full max-w-xl gap-6 lg:max-w-none lg:grid-cols-3 lg:items-stretch">
        {service.packages.map((pkg) => (
          <li
            key={pkg.id}
            className={cn(
              "relative flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 lg:p-8",
              pkg.popular && "shadow-xl ring-2 shadow-primary/10 ring-primary lg:-my-2 lg:py-10"
            )}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{pkg.name}</h3>
                {pkg.popular && <Badge>{popularLabel}</Badge>}
              </div>
              <p className="flex flex-wrap items-baseline gap-x-1.5">
                <span className={cn("font-heading font-bold", pkg.price === null ? "text-2xl" : "text-3xl")}>
                  {formatMNT(pkg.price)}
                </span>
                {pkg.price !== null && pkg.priceSuffix && (
                  <span className="text-sm text-muted-foreground">{pkg.priceSuffix}</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
            </div>

            <Button asChild size="lg" variant={pkg.popular ? "default" : "outline"} className="w-full">
              <Link href={`/contact?service=${service.slug}&package=${pkg.id}`}>
                {pkg.cta}
                <span className="sr-only">: {pkg.name}</span>
              </Link>
            </Button>

            <ul className="flex flex-col gap-3 border-t pt-6 text-sm" aria-label={`${pkg.name} багцад багтсан`}>
              {pkg.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <p className="mx-auto flex max-w-2xl items-start gap-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>{note}</span>
      </p>
    </div>
  )
}
