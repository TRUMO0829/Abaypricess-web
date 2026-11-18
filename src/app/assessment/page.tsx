import type { Metadata } from "next"

import { AssessmentWizard } from "@/components/assessment/assessment-wizard"
import { PageHeader } from "@/components/shared/page-header"
import { assessmentPage } from "@/content/assessment"

export const metadata: Metadata = {
  title: `${assessmentPage.title} ${assessmentPage.highlight}`,
  description: assessmentPage.description,
}

export default function AssessmentPage() {
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
          <AssessmentWizard />
        </div>
      </section>
    </>
  )
}
