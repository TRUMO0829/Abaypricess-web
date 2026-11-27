import { notFound } from "next/navigation"

import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"
import { PersonGrid } from "@/components/shared/person-card"

export function generateMetadata({ params }: PageProps<"/services/[slug]/trainers">) {
  return serviceMetadata(params, "trainers")
}

export default function TrainersPage({ params }: PageProps<"/services/[slug]/trainers">) {
  return (
    <ServiceRoute params={params}>
      {(service, content) => {
        const t = content.serviceDetailContent.trainers
        if (!service.trainers?.length) notFound()
        return (
          <ServiceSection id="trainers" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description}>
            <PersonGrid people={service.trainers} labels={content.cvLabels} className="lg:grid-cols-3" />
          </ServiceSection>
        )
      }}
    </ServiceRoute>
  )
}
