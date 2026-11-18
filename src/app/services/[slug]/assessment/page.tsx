import { AssessmentWizard } from "@/components/assessment/assessment-wizard"
import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"
import { serviceDetailContent } from "@/content/services"

export function generateMetadata({ params }: PageProps<"/services/[slug]/assessment">) {
  return serviceMetadata(params, "Асуулт хариулт")
}

/** Үйлчилгээ бүрийн «Асуулт хариулт» tab — `/assessment`-тэй ижил байгууллагын үнэлгээ (ноорог нь хуваалцагдана). */
export default function AssessmentTabPage({ params }: PageProps<"/services/[slug]/assessment">) {
  const t = serviceDetailContent.assessment
  return (
    <ServiceRoute params={params}>
      {() => (
        <ServiceSection id="assessment" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description}>
          <AssessmentWizard />
        </ServiceSection>
      )}
    </ServiceRoute>
  )
}
