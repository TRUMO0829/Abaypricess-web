import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"

import { ServiceTabs } from "@/components/services/service-tabs"
import { Button } from "@/components/ui/button"
import { getServiceTabs, serviceDetailContent } from "@/content/services"
import type { Service } from "@/types/content"

/** Үйлчилгээний бүх дэд хуудсанд нийтлэг толгой: нэр, захиалах товч, цэс. */
export function ServiceHeader({ service }: { service: Service }) {
  const Icon = service.icon
  const tabs = getServiceTabs(service)
  const pricing = tabs.find((tab) => tab.id === "pricing")

  return (
    <section className="border-b bg-muted/40">
      <div className="container flex flex-col gap-6 pt-12 md:pt-16">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Нүүр
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href="/services" className="hover:text-foreground">
            Үйлчилгээ
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-foreground">{service.name}</span>
        </nav>

        <div className="flex flex-col items-start gap-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Icon className="size-7" aria-hidden />
            </span>
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">{service.nameEn}</span>
          </div>
          <h1 className="text-3xl font-bold text-balance md:text-5xl">{service.name}</h1>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href={`/contact?service=${service.slug}`}>
                Захиалах
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Link>
            </Button>
            {pricing && (
              <Button asChild size="lg" variant="outline">
                <Link href={pricing.href}>Үнийн санал үзэх</Link>
              </Button>
            )}
          </div>
        </div>

        <ServiceTabs tabs={tabs} label={serviceDetailContent.hero.tabsLabel} />
      </div>
    </section>
  )
}
