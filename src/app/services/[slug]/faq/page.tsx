import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"
import { FaqAccordion } from "@/components/shared/faq-accordion"
import { serviceDetailContent } from "@/content/services"

export function generateMetadata({ params }: PageProps<"/services/[slug]/faq">) {
  return serviceMetadata(params, "Асуулт, хариулт")
}

export default function FaqPage({ params }: PageProps<"/services/[slug]/faq">) {
  const t = serviceDetailContent.faq
  return (
    <ServiceRoute params={params}>
      {(service) => (
        <ServiceSection eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} className="container flex max-w-3xl flex-col gap-10">
          <FaqAccordion items={service.faq} />
        </ServiceSection>
      )}
    </ServiceRoute>
  )
}
