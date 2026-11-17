import Link from "next/link"

import { company } from "@/content/company"
import { brandLogo } from "@/lib/brand"
import { cn } from "@/lib/utils"

/** Албан ёсны лого. CSS mask тул light горимд primary, dark горимд цагаан. Өндрийг className-аар өгнө. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-10 shrink-0 bg-primary mask-contain mask-center mask-no-repeat [print-color-adjust:exact] dark:bg-foreground",
        className
      )}
      style={{ aspectRatio: `${brandLogo.width} / ${brandLogo.height}`, maskImage: `url(${brandLogo.src})` }}
    />
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <BrandLogo />
      <span className="sr-only">{company.legalName}, нүүр хуудас</span>
    </Link>
  )
}
