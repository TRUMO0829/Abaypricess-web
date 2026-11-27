import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { HeroCards } from "@/components/home/hero-cards"
import { Button } from "@/components/ui/button"
import { getSiteContent } from "@/lib/content"

export async function Hero() {
  const { hero } = await getSiteContent()
  return (
    <section className="relative overflow-hidden border-b">
      {/* Зөөлөн брэнд gradient + торон дэвсгэр */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-accent/50 via-background to-background dark:from-accent/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-50 mask-[radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div className="container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:py-28">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-primary shadow-xs">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            {hero.eyebrow}
          </span>
          <h1 className="text-4xl leading-[1.1] font-bold text-balance sm:text-5xl xl:text-6xl">
            {hero.title}{" "}
            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {hero.highlight}
            </span>
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">{hero.description}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href={hero.primaryCta.href}>
                {hero.primaryCta.label}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
        <HeroCards />
      </div>
    </section>
  )
}
