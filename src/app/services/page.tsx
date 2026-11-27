import type { Metadata } from "next"

import { ServicesFlow } from "@/components/services/services-flow"
import { CtaBanner } from "@/components/shared/cta-banner"
import { PageHeader } from "@/components/shared/page-header"
import { SectionHeading } from "@/components/shared/section-heading"
import { getSiteContent } from "@/lib/content"

export async function generateMetadata(): Promise<Metadata> {
  const { servicesPageContent } = await getSiteContent()
  return { title: "Үйлчилгээ", description: servicesPageContent.header.description }
}

export default async function ServicesPage() {
  const { header, flow } = (await getSiteContent()).servicesPageContent

  return (
    <>
      <PageHeader
        title={header.title}
        highlight={header.highlight}
        description={header.description}
        breadcrumbs={[{ label: "Үйлчилгээ" }]}
      />

      <section className="py-20 md:py-28">
        <div className="container flex flex-col gap-12 md:gap-16">
          <SectionHeading
            eyebrow={flow.eyebrow}
            title={flow.title}
            highlight={flow.highlight}
            description={flow.description}
          />
          <ServicesFlow />
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
