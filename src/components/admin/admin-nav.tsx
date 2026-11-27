"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const items = [
  { href: "/admin", label: "Агуулга" },
  { href: "/admin/users", label: "Харилцагчид" },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Админы цэс" className="flex items-center gap-1">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/content") : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-2 py-1.5 text-sm sm:px-3 font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
              active && "bg-accent/60 text-primary"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
