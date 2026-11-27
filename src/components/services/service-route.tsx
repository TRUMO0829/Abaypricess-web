import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense, type ReactNode } from "react"

import { ServiceContentSkeleton } from "@/components/services/service-page-skeleton"
import { SectionHeading } from "@/components/shared/section-heading"
import { getService, type ServiceTabId } from "@/content/services"
import { getSiteContent, type SiteContent } from "@/lib/content"
import type { Service } from "@/types/content"

type SlugParams = Promise<{ slug: string }>

/** params-аас үйлчилгээг олно. Тодорхойгүй slug → notFound(). */
export async function resolveService(params: SlugParams): Promise<Service> {
  const { slug } = await params
  const service = getService(slug, (await getSiteContent()).services)
  if (!service) notFound()
  return service
}

/** Дэд хуудасны metadata: "Үнийн санал · Business Training Service". */
export async function serviceMetadata(params: SlugParams, tab?: ServiceTabId): Promise<Metadata> {
  const { slug } = await params
  const content = await getSiteContent()
  const service = getService(slug, content.services)
  const label = tab && content.serviceDetailContent.tabs[tab]
  if (!service) return {}
  return { title: label ? `${label} · ${service.name}` : service.name, description: service.shortDescription }
}

// params нь URL өгөгдөл тул Suspense дотор уншина — App Shell бүх slug-д нэг байж, навигаци шууд эхэлнэ.
type RouteChildren = (service: Service, content: SiteContent) => ReactNode

async function Resolved({ params, children }: { params: SlugParams; children: RouteChildren }) {
  const service = await resolveService(params)
  return children(service, await getSiteContent())
}

/** Дэд хуудасны агуулгыг үйлчилгээгээр нь render хийнэ. */
/** `children(service, content)` — content нь админы засвар орсон бүх текст. */
export function ServiceRoute({ params, children }: { params: SlugParams; children: RouteChildren }) {
  return (
    <Suspense fallback={<ServiceContentSkeleton />}>
      <Resolved params={params}>{children}</Resolved>
    </Suspense>
  )
}

interface ServiceSectionProps {
  id?: string
  eyebrow?: string
  title: string
  highlight?: string
  description?: string
  className?: string
  children: ReactNode
}

/** Дэд хуудасны нэг мэдээллийн хэсэг (гарчиг + агуулга). */
export function ServiceSection({ id, eyebrow, title, highlight, description, className, children }: ServiceSectionProps) {
  return (
    <section id={id} className="py-16 md:py-20">
      <div className={className ?? "container flex flex-col gap-12"}>
        <SectionHeading eyebrow={eyebrow} title={title} highlight={highlight} description={description} />
        {children}
      </div>
    </section>
  )
}
