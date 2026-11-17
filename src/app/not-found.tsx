import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BrandLogo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { notFoundContent as t } from "@/content/navigation"

export default function NotFound() {
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <BrandLogo className="h-14 opacity-90" />
      <p className="bg-linear-to-b from-primary/70 to-primary bg-clip-text font-heading text-7xl font-bold text-transparent md:text-8xl">
        {t.code}
      </p>
      <h1 className="text-3xl font-bold md:text-4xl">{t.title}</h1>
      <p className="max-w-md text-pretty text-muted-foreground">{t.description}</p>
      <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            {t.home}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/services">{t.services}</Link>
        </Button>
      </div>
    </section>
  )
}
