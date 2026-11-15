import Link from "next/link"

import { cn } from "@/lib/utils"

/** docs/brief/logo.png-ийн "P" хэлбэртэй гурвалжин тэмдэг. Өнгө нь token-оос тул dark горимд ч тод. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="16 16 290 372" aria-hidden="true" focusable="false" className={cn("h-8 w-auto shrink-0", className)}>
      <path
        className="fill-foreground"
        d="M22 52 80 20 302 150v46L108 322v-60l132-84L82 92l-60 28Z"
      />
      <path
        className="fill-primary"
        d="M22 152 80 124v68l62-36 54 30-110 64v94l22 12-86 32Z"
      />
    </svg>
  )
}

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
        <span className="text-primary">Abay</span>
        <span className="text-foreground">Pricess</span>
      </span>
      <span className="sr-only">— Абая Прайсэс ХХК, нүүр хуудас</span>
    </Link>
  )
}
