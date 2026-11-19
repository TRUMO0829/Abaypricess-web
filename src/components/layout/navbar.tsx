import { Suspense } from "react"
import Link from "next/link"

import { AccountMenu } from "@/components/layout/account-menu"
import { AccountSlot } from "@/components/layout/account-slot"
import { Logo } from "@/components/layout/logo"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { NavLinks } from "@/components/layout/nav-links"
import { Button } from "@/components/ui/button"
import { requestCta } from "@/content/navigation"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="hidden lg:flex">
          <NavLinks />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <ModeToggle />
          <Suspense fallback={<AccountMenu account={null} />}>
            <AccountSlot />
          </Suspense>
          <Button asChild className="hidden sm:inline-flex">
            <Link href={requestCta.href}>{requestCta.label}</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
