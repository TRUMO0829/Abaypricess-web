import { Compass, Target } from "lucide-react"

import { company } from "@/content/company"
import { cn } from "@/lib/utils"

interface MissionVisionProps {
  missionLabel: string
  visionLabel: string
  className?: string
}

export function MissionVision({ missionLabel, visionLabel, className }: MissionVisionProps) {
  const items = [
    { icon: Target, label: missionLabel, text: company.mission, featured: true },
    { icon: Compass, label: visionLabel, text: company.vision, featured: false },
  ]

  return (
    <div className={cn("grid gap-4", className)}>
      {items.map(({ icon: Icon, label, text, featured }) => (
        <figure
          key={label}
          className={cn(
            "relative overflow-hidden rounded-2xl border p-6",
            featured ? "border-primary bg-primary text-primary-foreground" : "bg-card"
          )}
        >
          <figcaption className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                featured ? "bg-primary-foreground/15" : "bg-primary/10 text-primary"
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="font-heading text-lg font-semibold">{label}</span>
          </figcaption>
          <blockquote className={cn("mt-4 text-pretty", featured ? "text-primary-foreground/90" : "text-muted-foreground")}>
            {text}
          </blockquote>
        </figure>
      ))}
    </div>
  )
}
