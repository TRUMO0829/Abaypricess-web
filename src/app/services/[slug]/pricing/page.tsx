import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"
import { ServicePricing } from "@/components/services/service-pricing"
import { serviceDetailContent } from "@/content/services"

export function generateMetadata({ params }: PageProps<"/services/[slug]/pricing">) {
  return serviceMetadata(params, "Үнийн санал")
}

export default function PricingPage({ params }: PageProps<"/services/[slug]/pricing">) {
  const t = serviceDetailContent.pricing
  return (
    <ServiceRoute params={params}>
      {(service) => (
        <ServiceSection id="pricing" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description}>
          <ServicePricing service={service} />
        </ServiceSection>
      )}
    </ServiceRoute>
  )
}
