import { notFound } from "next/navigation"

import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"
import { PersonGrid } from "@/components/shared/person-card"
import { serviceDetailContent } from "@/content/services"

export function generateMetadata({ params }: PageProps<"/services/[slug]/trainers">) {
  return serviceMetadata(params, "Сургагч багш")
}

export default function TrainersPage({ params }: PageProps<"/services/[slug]/trainers">) {
  const t = serviceDetailContent.trainers
  return (
    <ServiceRoute params={params}>
      {(service) => {
        if (!service.trainers?.length) notFound()
        return (
          <ServiceSection id="trainers" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description}>
            <PersonGrid people={service.trainers} className="lg:grid-cols-3" />
          </ServiceSection>
        )
      }}
    </ServiceRoute>
  )
}
