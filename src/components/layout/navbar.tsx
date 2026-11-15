import Link from "next/link"

import { Logo } from "@/components/layout/logo"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { Button } from "@/components/ui/button"
import { mainNav, requestCta } from "@/content/navigation"

// TODO(ABAY-1): үйлчилгээний dropdown, гар утасны Sheet цэс, идэвхтэй холбоосын төлөв
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Үндсэн цэс" className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Button key={item.href} asChild variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild className="hidden sm:inline-flex">
            <Link href={requestCta.href}>{requestCta.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
