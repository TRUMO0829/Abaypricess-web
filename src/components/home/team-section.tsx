import { PersonGrid } from "@/components/shared/person-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { getSiteContent } from "@/lib/content"

/** Нүүр: компанийн гишүүд, тэдний товч CV. */
export async function TeamSection() {
  const { team, teamSection: t, cvLabels } = await getSiteContent()
  return (
    <section id="team" className="scroll-mt-20 border-t py-20 md:py-28">
      <div className="container flex flex-col gap-12">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description} />
        <PersonGrid people={team} labels={cvLabels} />
      </div>
    </section>
  )
}
