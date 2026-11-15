import { FaqSection } from "@/components/home/faq-section"
import { Hero } from "@/components/home/hero"
import { IntroSection } from "@/components/home/intro-section"
import { ProcessFlow } from "@/components/home/process-flow"
import { ServicesPreview } from "@/components/home/services-preview"
import { Statistics } from "@/components/home/statistics"
import { CtaBanner } from "@/components/shared/cta-banner"

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroSection />
      <ProcessFlow className="border-t bg-muted/20" />
      <ServicesPreview />
      <Statistics />
      <FaqSection />
      <CtaBanner />
    </>
  )
}
