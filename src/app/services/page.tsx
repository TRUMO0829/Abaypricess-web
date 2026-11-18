import type { Metadata } from "next"

import { ServicesFlow } from "@/components/services/services-flow"
import { CtaBanner } from "@/components/shared/cta-banner"
import { PageHeader } from "@/components/shared/page-header"
import { SectionHeading } from "@/components/shared/section-heading"
import { servicesPageContent } from "@/content/services"

export const metadata: Metadata = {
  title: "Үйлчилгээ",
  description: servicesPageContent.header.description,
}

export default function ServicesPage() {
  const { header, flow } = servicesPageContent

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
