import Link from "next/link"

import { FaqAccordion } from "@/components/shared/faq-accordion"
import { SectionHeading } from "@/components/shared/section-heading"
import { generalFaq } from "@/content/faq"
import { homeSections } from "@/content/home"

const t = homeSections.faq

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-16 border-t py-20 md:py-28">
      <div className="container grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div className="flex flex-col items-start gap-4">
          <SectionHeading align="start" eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} />
          <p className="text-muted-foreground">
            {t.more}{" "}
            <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
              {t.contact}
            </Link>
          </p>
        </div>
        <FaqAccordion items={generalFaq} />
      </div>
    </section>
  )
}
