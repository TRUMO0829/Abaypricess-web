import Image from "next/image"

import type { reportPageContent } from "@/content/report"
import { brandLogo } from "@/lib/brand"
import { cn } from "@/lib/utils"
import type { ReportTemplate } from "@/types/content"

/** Жишээ мөрийн skeleton-ий өргөн (тогтмол — prerender/hydration-д ижил). */
const skeletonWidths = ["w-full", "w-11/12", "w-4/5"]

/**
 * A4 тайлангийн preview. Өндөр = max(A4 харьцаа, агуулга): grid-ийн нэг нүдэнд A4 spacer болон
 * агуулгыг давхарласан тул агуулга урт үед цаас сунана, хэзээ ч цааснаас гарахгүй. `light` class нь цаасыг dark горимд ч, хэвлэхэд ч цагаан байлгана
 * (globals.css-ийн `:root, .light` token scope).
 */
export function ReportPreview({
  template,
  t,
  company,
}: {
  template: ReportTemplate
  t: typeof reportPageContent
  company: { nameEn: string; legalName: string }
}) {
  const { paper } = t

  return (
    <article
      aria-label={template.title}
      className={cn(
        "light relative isolate mx-auto grid w-full max-w-[210mm] grid-cols-1 bg-card text-card-foreground",
        "rounded-sm shadow-2xl ring-1 shadow-foreground/10 ring-foreground/10",
        // print-color-adjust: хэвлэхэд графикийн багана, лого (дэвсгэр өнгө) алга болохгүй
        "[print-color-adjust:exact] print:max-w-none print:rounded-none print:shadow-none print:ring-0"
      )}
    >
      {/* ЖИШЭЭ watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center overflow-hidden justify-center font-heading text-[18vw] font-black tracking-widest text-primary/5 select-none md:text-[9rem] print:text-[9rem]"
      >
        <span className="-rotate-30">{paper.watermark}</span>
      </span>

      {/* A4 харьцааны хамгийн бага өндөр */}
      <div aria-hidden className="col-start-1 row-start-1 hidden w-full self-start md:block md:aspect-[210/297]" />

      <div className="col-start-1 row-start-1 flex min-w-0 flex-col gap-8 p-6 sm:p-10 md:p-[14mm]">
        {/* Толгой */}
        <header className="flex flex-col gap-6 border-b-2 border-primary pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              {/* Цаас үргэлж цагаан тул mask биш шууд зураг: PDF-д mask-ийн ирмэг дээр зураас гардаг */}
              <Image
                src={brandLogo.src}
                alt={company.nameEn}
                width={brandLogo.width}
                height={brandLogo.height}
                loading="eager"
                className="h-9 w-auto self-start"
              />
              <p className="text-[0.65rem] leading-none font-medium tracking-wider text-muted-foreground uppercase">
                {company.legalName}
              </p>
            </div>
            <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-xs">
              <dt className="text-muted-foreground">{paper.reportNoLabel}:</dt>
              <dd className="font-medium">{paper.reportNoValue}</dd>
              <dt className="text-muted-foreground">{paper.dateLabel}:</dt>
              <dd className="font-medium">{paper.dateValue}</dd>
            </dl>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">{template.subtitle}</p>
            <h2 className="text-2xl font-bold text-balance sm:text-3xl">{template.title}</h2>
            <p className="text-sm text-muted-foreground">
              {paper.clientLabel}: <span className="font-medium text-foreground">{paper.clientValue}</span>
            </p>
          </div>
        </header>

        {/* Гол үзүүлэлтүүд + bar chart */}
        <section aria-labelledby={`${template.service}-metrics`} className="flex flex-col gap-4">
          <h3 id={`${template.service}-metrics`} className="text-sm font-semibold tracking-wide uppercase">
            {paper.metricsTitle}
          </h3>
          <dl className="grid gap-3 sm:grid-cols-3">
            {template.metrics.map((metric) => (
              <div key={metric.label} className="rounded-md bg-muted p-3">
                <dt className="text-xs text-muted-foreground">{metric.label}</dt>
                <dd className="font-heading text-xl font-bold text-primary">{metric.value}</dd>
              </div>
            ))}
          </dl>
          <div
            role="img"
            aria-label={template.metrics.map((m) => `${m.label}: ${m.score ?? 0}/100`).join(", ")}
            className="flex h-28 items-end gap-4 border-b border-l border-border px-4 pt-2"
          >
            {template.metrics.map((metric) => (
              <div key={metric.label} className="flex h-full flex-1 flex-col justify-end gap-1">
                <span className="text-center text-[0.65rem] font-medium text-muted-foreground">
                  {metric.score ?? 0}
                </span>
                <span
                  className="block rounded-t-sm bg-linear-to-t from-primary to-primary/60 print:bg-primary"
                  style={{ height: `${metric.score ?? 0}%` }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Дугаартай бүлгүүд */}
        <div className="flex flex-1 flex-col gap-5">
          {template.sections.map((section) => (
            <section key={section.id} className="flex flex-col gap-2 break-inside-avoid">
              <h3 className="text-base font-semibold">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.description}</p>
              {section.items && (
                <ul className="flex flex-wrap gap-1.5">
                  {section.items.map((item) => (
                    <li key={item} className="rounded-sm border border-primary/20 px-2 py-0.5 text-xs text-primary">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <div aria-hidden className="flex flex-col gap-1.5 pt-1">
                {skeletonWidths.slice(0, section.items ? 2 : 3).map((width) => (
                  <span key={width} className={cn("h-1.5 rounded-full bg-muted", width)} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Хөл */}
        <footer className="flex flex-col gap-1 border-t pt-4 text-[0.65rem] text-muted-foreground sm:flex-row sm:justify-between">
          <span>{paper.footer}</span>
          <span>{paper.page}</span>
        </footer>
      </div>
    </article>
  )
}
