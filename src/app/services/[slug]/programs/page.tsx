import { notFound } from "next/navigation"

import { ProgramList } from "@/components/services/program-list"
import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"
import { serviceDetailContent } from "@/content/services"

export function generateMetadata({ params }: PageProps<"/services/[slug]/programs">) {
  return serviceMetadata(params, "Хөтөлбөр")
}

export default function ProgramsPage({ params }: PageProps<"/services/[slug]/programs">) {
  const t = serviceDetailContent.programs
  return (
    <ServiceRoute params={params}>
      {(service) => {
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
