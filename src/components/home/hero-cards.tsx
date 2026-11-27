import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getSiteContent } from "@/lib/content"

/** Hero-гийн баруун талын карт: үндсэн 3 үйлчилгээ, тус бүр нь хуудас руугаа холбогдоно. */
export async function HeroCards() {
  const { heroCards, flowStages } = await getSiteContent()
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-8 -z-10 rounded-full bg-primary/15 blur-3xl dark:bg-primary/10" />

      <div className="rounded-2xl border bg-card p-5 shadow-xl shadow-primary/5 sm:p-6">
        <p className="font-heading text-base font-semibold">{heroCards.process.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{heroCards.process.description}</p>
        <ul className="mt-5 flex flex-col gap-2">
          {flowStages.map((stage) => {
            const Icon = stage.icon
            return (
              <li key={stage.id}>
                <Link
                  href={stage.href}
                  className="group flex items-center gap-3 rounded-xl border bg-background/60 p-3 transition-colors outline-none hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                      {stage.lane}
                    </span>
                    <span className="text-sm font-medium">{stage.action}</span>
                  </span>
                  <ArrowRight
                    className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
