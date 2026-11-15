import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { NextStep } from "@/components/services/next-step"
import { ProcessStepper } from "@/components/services/process-stepper"
import { ProgramList } from "@/components/services/program-list"
import { ServiceHero } from "@/components/services/service-hero"
import { ServicePricing } from "@/components/services/service-pricing"
import { CtaBanner } from "@/components/shared/cta-banner"
import { FaqAccordion } from "@/components/shared/faq-accordion"
import { SectionHeading } from "@/components/shared/section-heading"
import { getService, serviceDetailContent, services } from "@/content/services"

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)
  return service ? { title: service.name, description: service.shortDescription } : {}
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  const { process, programs, pricing, faq } = serviceDetailContent

  return (
    <>
      <ServiceHero service={service} />

      <section id="process" className="scroll-mt-20 py-20 md:py-28">
        <div className="container flex flex-col gap-12">
          <SectionHeading
            eyebrow={process.eyebrow}
            title={process.title}
            highlight={process.highlight}
            description={process.description}
          />
          <ProcessStepper steps={service.process} label={`${service.name}: процессын алхмууд`} />
        </div>
      </section>

      {service.programs && service.programs.length > 0 && (
        <section id="programs" className="scroll-mt-20 border-t py-20 md:py-28">
          <div className="container flex flex-col gap-12">
            <SectionHeading
              eyebrow={programs.eyebrow}
              title={programs.title}
              highlight={programs.highlight}
              description={programs.description}
            />
            <ProgramList programs={service.programs} />
          </div>
        </section>
      )}

      <section id="pricing" className="scroll-mt-20 border-t bg-muted/40 py-20 md:py-28">
        <div className="container flex flex-col gap-12">
          <SectionHeading
            eyebrow={pricing.eyebrow}
            title={pricing.title}
            highlight={pricing.highlight}
            description={pricing.description}
          />
          <ServicePricing service={service} />
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 py-20 md:py-28">
        <div className="container flex max-w-3xl flex-col gap-10">
          <SectionHeading eyebrow={faq.eyebrow} title={faq.title} highlight={faq.highlight} />
          <FaqAccordion items={service.faq} />
        </div>
      </section>

      <section aria-label="Дараагийн алхам" className="border-t bg-muted/40 py-14 md:py-16">
        <div className="container max-w-3xl">
          <NextStep slug={service.slug} />
        </div>
      </section>

      <CtaBanner primary={{ label: "Хүсэлт илгээх", href: `/contact?service=${service.slug}` }} />
    </>
  )
}
