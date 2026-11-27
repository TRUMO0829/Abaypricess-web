import { notFound } from "next/navigation"

import { ProgramList } from "@/components/services/program-list"
import { ServiceDocuments } from "@/components/services/service-documents"
import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"

export function generateMetadata({ params }: PageProps<"/services/[slug]/programs">) {
  return serviceMetadata(params, "programs")
}

export default function ProgramsPage({ params }: PageProps<"/services/[slug]/programs">) {
  return (
    <ServiceRoute params={params}>
      {(service, content) => {
        const t = content.serviceDetailContent.programs
        const documents = content.serviceDetailContent.documents
        if (!service.programs?.length && !service.programFiles.length) notFound()
        return (
          <ServiceSection eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description}>
            <div className="flex flex-col gap-12">
              {service.programs?.length ? <ProgramList programs={service.programs} /> : null}
              <ServiceDocuments title={documents.programs} openLabel={documents.open} documents={service.programFiles} />
            </div>
          </ServiceSection>
        )
      }}
    </ServiceRoute>
  )
}
