"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface ServiceTab {
  id: string
  label: string
  href: string
}

/** Үйлчилгээний дэд хуудсуудын цэс. Идэвхтэй tab-ийг хаягаар нь (яг тэнцүү) тодруулна. */
export function ServiceTabs({ tabs, label }: { tabs: ServiceTab[]; label: string }) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)

  // Гар утсанд цэс хэвтээ scroll-той тул идэвхтэй tab-ийг голд нь харагдуулна
  useEffect(() => {
    const nav = navRef.current
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (nav && active) nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2
  }, [pathname])

  return (
    <nav ref={navRef} aria-label={label} className="relative -mb-px flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-t-md border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
