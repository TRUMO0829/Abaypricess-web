import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CtaBannerProps {
  title?: string
  description?: string
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string }
}

export function CtaBanner({
  title = "Байгууллагынхаа дараагийн алхмыг хамтдаа төлөвлөе",
  description = "Хүсэлтээ илгээвэл манай зөвлөх 1 ажлын өдрийн дотор холбогдож, танд тохирох үйлчилгээ, үнийн саналыг танилцуулна.",
  primary = { label: "Хүсэлт илгээх", href: "/contact" },
  secondary = { label: "Тайлангийн загвар үзэх", href: "/report" },
}: CtaBannerProps) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-bold text-balance md:text-3xl">{title}</h2>
          <p className="text-primary-foreground/80">{description}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href={primary.href}>
              {primary.label}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:bg-transparent"
          >
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
