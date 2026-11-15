import { CtaBanner } from "@/components/shared/cta-banner"
import { SectionHeading } from "@/components/shared/section-heading"
import { hero } from "@/content/home"

// TODO(ABAY-1): Hero, HeroCards, Эрхэм зорилго, ProcessFlow, ServicesPreview, Statistics, FAQ
export default function HomePage() {
  return (
    <>
      <section className="container py-20 md:py-32">
        <SectionHeading as="h1" eyebrow={hero.eyebrow} title={hero.title} highlight={hero.highlight} description={hero.description} />
      </section>
      <CtaBanner />
    </>
  )
}
