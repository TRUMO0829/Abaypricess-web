import { Hero } from "@/components/home/hero"
import { IntroSection } from "@/components/home/intro-section"
import { TeamSection } from "@/components/home/team-section"
import { CtaBanner } from "@/components/shared/cta-banner"

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroSection />
      <TeamSection />
      <CtaBanner />
    </>
  )
}
