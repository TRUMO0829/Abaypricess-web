import { AssessmentWizard } from "@/components/assessment/assessment-wizard"
import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"

export function generateMetadata({ params }: PageProps<"/services/[slug]/assessment">) {
  return serviceMetadata(params, "assessment")
}

/** Үйлчилгээ бүрийн «Үнэлгээний асуулт» tab — `/assessment`-тэй ижил байгууллагын үнэлгээ (ноорог нь хуваалцагдана). */
export default function AssessmentTabPage({ params }: PageProps<"/services/[slug]/assessment">) {
  return (
    <ServiceRoute params={params}>
      {(_service, content) => {
        const t = content.serviceDetailContent.assessment
        return (
          <ServiceSection id="assessment" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description}>
            <AssessmentWizard assessment={content.assessment} t={content.assessmentPage} />
          </ServiceSection>
        )
      }}
    </ServiceRoute>
  )
}
