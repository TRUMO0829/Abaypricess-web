import { notFound } from "next/navigation"

import { PrintButton } from "@/components/report/print-button"
import { ReportPreview } from "@/components/report/report-preview"
import { ServiceRoute, serviceMetadata } from "@/components/services/service-route"
import { SectionHeading } from "@/components/shared/section-heading"
import { getReportTemplate, reportPageContent as t } from "@/content/report"
import { serviceDetailContent } from "@/content/services"

export function generateMetadata({ params }: PageProps<"/services/[slug]/report">) {
  return serviceMetadata(params, "Тайлан")
}

export default function ReportPage({ params }: PageProps<"/services/[slug]/report">) {
  const heading = serviceDetailContent.report
  return (
    <ServiceRoute params={params}>
      {(service) => {
        const template = getReportTemplate(service.slug)
        if (!template) notFound()
        return (
          <section className="py-16 md:py-20 print:p-0">
            <div className="container flex flex-col gap-10 print:max-w-none print:p-0">
              <div className="flex flex-col items-center gap-6 print:hidden">
                <SectionHeading
                  eyebrow={heading.eyebrow}
                  title={heading.title}
                  highlight={heading.highlight}
                  description={t.description}
                />
                <div className="flex flex-col items-center gap-1">
                  <PrintButton label={t.printLabel} />
                  <p className="text-xs text-muted-foreground">{t.printHint}</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 sm:p-6 md:p-10 print:bg-transparent print:p-0">
                <ReportPreview template={template} />
              </div>
            </div>
          </section>
        )
      }}
    </ServiceRoute>
  )
}
