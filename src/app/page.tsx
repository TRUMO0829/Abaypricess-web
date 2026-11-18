import { FaqSection } from "@/components/home/faq-section"
import { Hero } from "@/components/home/hero"
import { IntroSection } from "@/components/home/intro-section"
import { ProcessFlow } from "@/components/home/process-flow"
import { ServicesPreview } from "@/components/home/services-preview"
import { TeamSection } from "@/components/home/team-section"
import { CtaBanner } from "@/components/shared/cta-banner"

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroSection />
      <TeamSection />
      <ProcessFlow className="border-t bg-muted/20" />
      <ServicesPreview />
      <FaqSection />
      <CtaBanner />
    </>
  )
}
