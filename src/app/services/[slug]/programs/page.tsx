import { notFound } from "next/navigation"

import { ProgramList } from "@/components/services/program-list"
import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"

export function generateMetadata({ params }: PageProps<"/services/[slug]/programs">) {
  return serviceMetadata(params, "programs")
}

export default function ProgramsPage({ params }: PageProps<"/services/[slug]/programs">) {
  return (
    <ServiceRoute params={params}>
      {(service, content) => {
        const t = content.serviceDetailContent.programs
        if (!service.programs?.length) notFound()
        return (
          <ServiceSection eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description}>
            <ProgramList programs={service.programs} />
          </ServiceSection>
        )
      }}
    </ServiceRoute>
  )
}
