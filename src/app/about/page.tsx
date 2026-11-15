import type { Metadata } from "next"

import { MissionVision } from "@/components/home/mission-vision"
import { ProcessFlow } from "@/components/home/process-flow"
import { ValuesGrid } from "@/components/home/values-grid"
import { CtaBanner } from "@/components/shared/cta-banner"
import { PageHeader } from "@/components/shared/page-header"
import { SectionHeading } from "@/components/shared/section-heading"
import { aboutPage as t, company } from "@/content/company"

export const metadata: Metadata = {
  title: "Бидний тухай",
  description: company.intro,
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        highlight={t.highlight}
        description={company.tagline}
        breadcrumbs={[{ label: "Бидний тухай" }]}
      />

      <section className="py-20 md:py-28">
        <div className="container grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold text-balance md:text-4xl">{t.introTitle}</h2>
            <p className="text-lg text-pretty text-muted-foreground">{company.intro}</p>
          </div>
          <MissionVision missionLabel={t.missionLabel} visionLabel={t.visionLabel} />
        </div>
      </section>

      <section className="border-y bg-muted/40 py-20 md:py-28">
        <div className="container flex flex-col gap-12">
          <SectionHeading eyebrow={t.valuesEyebrow} title={t.valuesTitle} highlight={t.valuesHighlight} />
          <ValuesGrid />
        </div>
      </section>

      <ProcessFlow eyebrow={t.processEyebrow} title={t.processTitle} highlight={t.processHighlight} />

      <CtaBanner />
    </>
  )
}
