import Link from "next/link"

import { Logo } from "@/components/layout/logo"
import { company } from "@/content/company"
import { mainNav } from "@/content/navigation"

// TODO(ABAY-1): загварын Footer-ийн бүтэц (баганууд, сошиал холбоос) руу өргөтгөх
export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{company.tagline}</p>
        </div>
        <nav aria-label="Доод цэс" className="flex flex-col gap-2 text-sm">
          {mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <address className="space-y-1 text-sm text-muted-foreground not-italic">
          <p>{company.contact.address}</p>
          <p>{company.contact.phone}</p>
          <p>{company.contact.email}</p>
          <p>{company.contact.hours}</p>
        </address>
      </div>
      <div className="border-t py-6 text-center text-sm text-muted-foreground">
        © <CopyrightYear /> {company.legalName}. Бүх эрх хуулиар хамгаалагдсан.
      </div>
    </footer>
  )
}

async function CopyrightYear() {
  "use cache"
  return new Date().getFullYear()
}
