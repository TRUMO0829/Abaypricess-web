import { PersonGrid } from "@/components/shared/person-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { team, teamSection as t } from "@/content/team"

/** Нүүр: компанийн гишүүд, тэдний товч CV. */
export function TeamSection() {
  return (
    <section id="team" className="scroll-mt-20 border-t py-20 md:py-28">
      <div className="container flex flex-col gap-12">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} description={t.description} />
        <PersonGrid people={team} />
      </div>
    </section>
  )
}
