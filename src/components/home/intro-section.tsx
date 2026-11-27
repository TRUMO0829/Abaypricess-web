import { Download } from "lucide-react"

import { IntroVideo } from "@/components/home/intro-video"
import { ValuesGrid } from "@/components/home/values-grid"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { getSiteContent } from "@/lib/content"


export async function IntroSection() {
  const { company, homeSections } = await getSiteContent()
  const t = homeSections.intro
  return (
    <section id="about" className="scroll-mt-16 py-20 md:py-28">
      <div className="container flex flex-col gap-12">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <SectionHeading align="start" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} />
            <p className="text-lg text-pretty text-muted-foreground">{company.intro}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href={t.brochure.href} download={t.brochure.fileName}>
                  <Download data-icon="inline-start" aria-hidden />
                  {t.brochure.label}
                </a>
              </Button>
              <span className="text-sm text-muted-foreground">{t.brochure.meta}</span>
            </div>
          </div>
          <IntroVideo url={t.video.url} title={t.video.title} placeholder={t.video.placeholder} />
        </div>
        <ValuesGrid />
      </div>
    </section>
  )
}
