import { SectionHeading } from "@/components/shared/section-heading"
import { homeSections, stats } from "@/content/home"

const t = homeSections.stats

export function Statistics() {
  return (
    <section className="py-20 md:py-28">
      <div className="container flex flex-col gap-12">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} highlight={t.highlight} />
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2 bg-card px-4 py-8 text-center md:py-10">
              <dt className="order-2 text-sm text-pretty text-muted-foreground">{stat.label}</dt>
              <dd className="order-1 bg-linear-to-b from-primary/70 to-primary bg-clip-text font-heading text-4xl font-bold text-transparent md:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
