import { CheckCircle2, FileText } from "lucide-react"

import { NextStep } from "@/components/services/next-step"
import { ProcessStepper } from "@/components/services/process-stepper"
import { ServiceRoute, ServiceSection, serviceMetadata } from "@/components/services/service-route"
import { getNextService, serviceDetailContent } from "@/content/services"
import type { Service } from "@/types/content"

export function generateMetadata({ params }: PageProps<"/services/[slug]">) {
  return serviceMetadata(params)
}

function Overview({ service }: { service: Service }) {
  const { hero, process } = serviceDetailContent

  return (
    <>
      <section className="py-16 md:py-20">
        <div className="container grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-16">
          <p className="text-lg text-pretty text-muted-foreground md:text-xl">{service.description}</p>
          <aside className="flex flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="text-base font-semibold">{hero.benefitsTitle}</h2>
            <ul className="flex flex-col gap-3">
              {service.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-4 text-sm ring-1 ring-primary/15">
              <FileText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-xs text-muted-foreground">{hero.deliverableLabel}</p>
                <p className="font-medium">{service.deliverable}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="border-t">
        <ServiceSection
          id="process"
          eyebrow={process.eyebrow}
          title={process.title}
          highlight={process.highlight}
          description={process.description}
        >
          <ProcessStepper steps={service.process} label={`${service.name}: процессын алхмууд`} />
        </ServiceSection>
      </div>

      {getNextService(service.slug) && (
        <section aria-label="Дараагийн алхам" className="border-t bg-muted/40 py-14 md:py-16">
          <div className="container max-w-3xl">
            <NextStep slug={service.slug} />
          </div>
        </section>
      )}
    </>
  )
}

export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  return <ServiceRoute params={params}>{(service) => <Overview service={service} />}</ServiceRoute>
}
