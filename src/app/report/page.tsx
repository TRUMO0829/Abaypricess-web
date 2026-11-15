import type { Metadata } from "next"

import { PrintButton } from "@/components/report/print-button"
import { ReportAside } from "@/components/report/report-aside"
import { ReportPreview } from "@/components/report/report-preview"
import { PageHeader } from "@/components/shared/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { reportPageContent, reportTemplates } from "@/content/report"

export const metadata: Metadata = {
  title: "Тайлангийн загвар",
  description: reportPageContent.header.description,
}

export default function ReportPage() {
  const { header, tabsLabel, tabLabels, printLabel, printHint } = reportPageContent
  const first = reportTemplates[0]

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={header.title}
          highlight={header.highlight}
          description={header.description}
          breadcrumbs={[{ label: "Тайлангийн загвар" }]}
        />
      </div>

      <section className="py-14 md:py-20 print:p-0">
        <Tabs defaultValue={first?.service} className="container gap-8 print:max-w-none print:p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <TabsList aria-label={tabsLabel} className="h-10! w-full sm:w-fit">
              {reportTemplates.map((template) => (
                <TabsTrigger key={template.service} value={template.service} className="px-4">
                  {tabLabels[template.service]}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex flex-col gap-1 sm:items-end">
              <PrintButton label={printLabel} />
              <p className="text-xs text-muted-foreground">{printHint}</p>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12 print:block">
            <div className="rounded-xl bg-muted/50 p-3 sm:p-6 md:p-10 print:bg-transparent print:p-0">
              {reportTemplates.map((template) => (
                <TabsContent key={template.service} value={template.service}>
                  <ReportPreview template={template} />
                </TabsContent>
              ))}
            </div>
            <ReportAside />
          </div>
        </Tabs>
      </section>
    </>
  )
}
