import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { SectionHeading } from "@/components/shared/section-heading"

interface Crumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  highlight?: string
  description?: string
  eyebrow?: string
  breadcrumbs?: Crumb[]
}

/** Дотоод хуудасны (about, services, contact) дээд хэсэг. */
export function PageHeader({ title, highlight, description, eyebrow, breadcrumbs }: PageHeaderProps) {
  return (
    <section className="border-b bg-muted/40">
      <div className="container flex flex-col gap-6 py-12 md:py-16">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Нүүр
            </Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.label} className="flex items-center gap-1">
                <ChevronRight className="size-3.5" aria-hidden />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <SectionHeading
          as="h1"
          align="start"
          eyebrow={eyebrow}
          title={title}
          highlight={highlight}
          description={description}
        />
      </div>
    </section>
  )
}
