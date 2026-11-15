import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/shared/page-header"
import { getService, services } from "@/content/services"

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)
  return service ? { title: service.name, description: service.shortDescription } : {}
}

// TODO(ABAY-2): ServiceHero, ProcessStepper, ProgramList, ServicePricing, FAQ, дараагийн үйлчилгээ
export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  return (
    <PageHeader
      eyebrow={service.nameEn}
      title={service.name}
      description={service.description}
      breadcrumbs={[{ label: "Үйлчилгээ", href: "/services" }, { label: service.name }]}
    />
  )
}
