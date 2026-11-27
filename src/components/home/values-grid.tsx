import { Compass, Flag } from "lucide-react"

import { getSiteContent } from "@/lib/content"
import { cn } from "@/lib/utils"


/** Эрхэм зорилго, алсын хараа + үнэт зүйлс — нэг ижил картын grid. */
export async function ValuesGrid({ className }: { className?: string }) {
  const { company, homeSections } = await getSiteContent()
  const t = homeSections.intro
  const items = [
    { icon: Flag, title: t.missionLabel, description: company.mission },
    { icon: Compass, title: t.visionLabel, description: company.vision },
    ...company.values,
  ]

  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map(({ icon: Icon, title, description }) => (
        <li key={title} className="group flex flex-col gap-3 rounded-2xl border bg-card p-6 transition-colors hover:border-primary/50">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-5" aria-hidden />
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-pretty text-muted-foreground">{description}</p>
        </li>
      ))}
    </ul>
  )
}
