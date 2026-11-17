"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { isActivePath, serviceIcon } from "@/components/layout/nav-links"
import { BrandLogo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { company } from "@/content/company"
import { mainNav, requestCta } from "@/content/navigation"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Цэс нээх">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] gap-0 overflow-y-auto">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 font-bold">
            <BrandLogo className="h-8" />
            <span className="sr-only">{company.legalName}</span>
          </SheetTitle>
          <SheetDescription>{company.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label="Гар утасны цэс" className="flex flex-col gap-1 p-4">
          {mainNav.map((item) => {
            const active = isActivePath(pathname, item.href)
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "flex rounded-md px-3 py-2.5 text-base font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                    active && "bg-accent/60 text-primary dark:bg-accent/40"
                  )}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="mt-1 ml-3 flex flex-col gap-0.5 border-l pl-3">
                    {item.children.map((child) => {
                      const Icon = serviceIcon(child.href)
                      const childActive = isActivePath(pathname, child.href)
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={close}
                            aria-current={childActive ? "page" : undefined}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-2 py-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                              childActive && "text-primary"
                            )}
                          >
                            {Icon && <Icon className="size-4 shrink-0 text-primary" aria-hidden />}
                            <span className="flex flex-col">
                              <span className="text-sm font-medium">{child.label}</span>
                              <span className="text-xs text-muted-foreground">{child.description}</span>
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>
        <div className="mt-auto border-t p-4">
          <Button asChild size="lg" className="w-full">
            <Link href={requestCta.href} onClick={close}>
              {requestCta.label}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
