import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { ScrollToTop } from "@/components/layout/scroll-to-top"
import { company } from "@/content/company"
import { footerNav } from "@/content/navigation"
import type { NavItem } from "@/types/content"

const linkClass =
  "rounded-sm text-muted-foreground transition-colors outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"

function FooterColumn({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Footer() {
  const { contact } = company
  const contactRows = [
    { icon: Phone, content: <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className={linkClass}>{contact.phone}</a> },
    { icon: Mail, content: <a href={`mailto:${contact.email}`} className={linkClass}>{contact.email}</a> },
    { icon: MapPin, content: contact.address },
    { icon: Clock, content: contact.hours },
  ]

  return (
    <footer className="border-t bg-muted/40">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm text-pretty text-muted-foreground">{company.tagline}</p>
        </div>
        <FooterColumn title={footerNav.services.title} items={footerNav.services.items} />
        <FooterColumn title={footerNav.company.title} items={footerNav.company.items} />
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">{footerNav.contactTitle}</h2>
          <address className="flex flex-col gap-2.5 text-sm text-muted-foreground not-italic">
            {contactRows.map(({ icon: Icon, content }, index) => (
              <span key={index} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 break-words">{content}</span>
              </span>
            ))}
          </address>
        </div>
      </div>
      <div className="border-t">
        <p className="container py-6 text-center text-sm text-muted-foreground">
          © <CopyrightYear /> {company.legalName}. {footerNav.rights}
        </p>
      </div>
      <ScrollToTop label={footerNav.scrollTop} />
    </footer>
  )
}

async function CopyrightYear() {
  "use cache"
  return new Date().getFullYear()
}
