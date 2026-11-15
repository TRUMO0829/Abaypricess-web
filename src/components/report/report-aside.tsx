import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { reportPageContent } from "@/content/report"

export function ReportAside() {
  const { aside } = reportPageContent

  return (
    <aside className="flex flex-col gap-6 print:hidden">
      <section aria-labelledby="report-contents-title" className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <h2 id="report-contents-title" className="text-lg font-semibold">
          {aside.title}
        </h2>
        <ul className="mt-5 flex flex-col gap-4">
          {aside.items.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="report-cta-title" className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h2 id="report-cta-title" className="text-lg font-semibold">
          {aside.ctaTitle}
        </h2>
        <p className="mt-2 text-sm text-primary-foreground/80">{aside.ctaDescription}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button asChild variant="secondary">
            <Link href="/contact">
              {aside.ctaLabel}
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/services">{aside.servicesLabel}</Link>
          </Button>
        </div>
      </section>
    </aside>
  )
}
