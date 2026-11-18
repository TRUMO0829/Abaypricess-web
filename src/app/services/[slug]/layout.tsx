import { Suspense } from "react"

import { ServiceHeader } from "@/components/services/service-header"
import { ServiceHeaderSkeleton } from "@/components/services/service-page-skeleton"
import { resolveService } from "@/components/services/service-route"
import { services } from "@/content/services"

// Мэдэгдэж буй slug-ууд (болон тэдгээрийн бүх дэд хуудас) бүрэн prerender хийгдэнэ.
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

async function Header({ params }: Pick<LayoutProps<"/services/[slug]">, "params">) {
  return <ServiceHeader service={await resolveService(params)} />
}

export default function ServiceLayout({ children, params }: LayoutProps<"/services/[slug]">) {
  return (
    <>
      {/* contents: хэвлэх үед (тайлан) толгойг нуух */}
      <div className="contents print:hidden">
        <Suspense fallback={<ServiceHeaderSkeleton />}>
          <Header params={params} />
        </Suspense>
      </div>
      {children}
    </>
  )
}
