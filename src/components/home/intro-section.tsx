import { MissionVision } from "@/components/home/mission-vision"
import { ValuesGrid } from "@/components/home/values-grid"
import { SectionHeading } from "@/components/shared/section-heading"
import { company } from "@/content/company"
import { homeSections } from "@/content/home"

const t = homeSections.intro

export function IntroSection() {
  return (
    <section id="about" className="scroll-mt-16 py-20 md:py-28">
      <div className="container flex flex-col gap-12">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <SectionHeading align="start" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} />
            <p className="text-lg text-pretty text-muted-foreground">{company.intro}</p>
          </div>
          <MissionVision missionLabel={t.missionLabel} visionLabel={t.visionLabel} />
        </div>
        <ValuesGrid />
      </div>
    </section>
  )
}
