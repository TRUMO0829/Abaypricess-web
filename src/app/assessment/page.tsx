import type { Metadata } from "next"

import { AssessmentWizard } from "@/components/assessment/assessment-wizard"
import { PageHeader } from "@/components/shared/page-header"
import { getSiteContent } from "@/lib/content"

export async function generateMetadata(): Promise<Metadata> {
  const { assessmentPage } = await getSiteContent()
  return { title: `${assessmentPage.title} ${assessmentPage.highlight}`, description: assessmentPage.description }
}

export default async function AssessmentPage() {
  const { assessmentPage, assessment } = await getSiteContent()
  return (
    <>
      <PageHeader
        title={assessmentPage.title}
        highlight={assessmentPage.highlight}
        description={assessmentPage.description}
        breadcrumbs={[{ label: assessmentPage.navLabel }]}
      />
      <section className="py-14 md:py-20">
        <div className="container">
          <AssessmentWizard assessment={assessment} t={assessmentPage} />
        </div>
      </section>
    </>
  )
}
