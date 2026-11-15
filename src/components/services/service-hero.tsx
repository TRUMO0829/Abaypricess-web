import Link from "next/link"
import { ArrowRight, CheckCircle2, ChevronRight, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { serviceDetailContent, services } from "@/content/services"
import { cn } from "@/lib/utils"
import type { Service } from "@/types/content"

export function ServiceHero({ service }: { service: Service }) {
  const Icon = service.icon
  const { benefitsTitle, deliverableLabel, flowLabel } = serviceDetailContent.hero
  const sections = serviceDetailContent.sectionNav.filter(
    (section) => section.id !== "programs" || (service.programs?.length ?? 0) > 0
  )

  return (
    <section className="border-b bg-muted/40">
      <div className="container flex flex-col gap-8 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Нүүр
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href="/services" className="hover:text-foreground">
            Үйлчилгээ
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-foreground" aria-current="page">
            {service.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Icon className="size-7" aria-hidden />
              </span>
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">{service.nameEn}</span>
            </div>
            <h1 className="text-3xl font-bold text-balance md:text-5xl">{service.name}</h1>
            <p className="max-w-2xl text-lg text-pretty text-muted-foreground">{service.description}</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg">
                <Link href={`/contact?service=${service.slug}`}>
                  Захиалах
                  <ArrowRight data-icon="inline-end" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#pricing">Үнийн санал үзэх</Link>
              </Button>
            </div>

            {/* Нийт урсгал дахь байршил */}
            <nav aria-label={flowLabel} className="w-full max-w-md pt-2">
              <ol className="flex items-center gap-2">
                {services.map((item) => {
                  const current = item.slug === service.slug
                  return (
                    <li key={item.slug} className="flex flex-1">
                      <Link
                        href={`/services/${item.slug}`}
                        aria-current={current ? "page" : undefined}
                        title={item.name}
                        className={cn(
                          "flex flex-1 flex-col gap-1.5 rounded-md text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          current ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn("h-1 rounded-full", current ? "bg-primary" : "bg-border")}
                        />
                        <span>
                          {item.order}. {item.nameEn.replace(/^Business\s|\sService$/g, "")}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>

          <aside className="flex flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="text-base font-semibold">{benefitsTitle}</h2>
            <ul className="flex flex-col gap-3">
              {service.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-4 text-sm ring-1 ring-primary/15">
              <FileText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-xs text-muted-foreground">{deliverableLabel}</p>
                <p className="font-medium">{service.deliverable}</p>
              </div>
            </div>
          </aside>
        </div>

        <nav aria-label="Хуудасны хэсгүүд" className="-mb-4 flex gap-1 overflow-x-auto border-t pt-4 md:-mb-8">
          {sections.map((section) => (
            <Button key={section.id} asChild variant="ghost" size="sm" className="shrink-0">
              <Link href={`#${section.id}`}>{section.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </section>
  )
}
