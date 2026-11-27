import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"
import { ServicePricing } from "@/components/services/service-pricing"

export function generateMetadata({ params }: PageProps<"/services/[slug]/pricing">) {
  return serviceMetadata(params, "pricing")
}

export default function PricingPage({ params }: PageProps<"/services/[slug]/pricing">) {
  return (
    <ServiceRoute params={params}>
      {(service, content) => {
        const t = content.serviceDetailContent.pricing
        return (
          <ServiceSection id="pricing" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description}>
            <ServicePricing service={service} t={t} />
          </ServiceSection>
        )
      }}
    </ServiceRoute>
  )
}
