import Link from "next/link"

import { company } from "@/content/company"
import { logoMark } from "@/lib/brand"
import { cn } from "@/lib/utils"

/** "A" тэмдэг. Өнгө нь token-оос тул dark горимд ч тод. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox={logoMark.viewBox} aria-hidden="true" focusable="false" className={cn("h-8 w-auto shrink-0", className)}>
      <path className="fill-foreground" d={logoMark.ink} />
      <path className="fill-primary" d={logoMark.accent} />
    </svg>
  )
}

const [firstWord, ...restWords] = company.nameEn.split(" ")

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 rounded-md font-heading leading-none font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <LogoMark />
      <span className="flex flex-col text-[1.05rem] leading-[0.95]">
        <span className="text-primary">{firstWord}</span>
        <span className="text-foreground">{restWords.join(" ")}</span>
      </span>
      <span className="sr-only">— {company.legalName}, нүүр хуудас</span>
    </Link>
  )
}
