import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { company } from "@/content/company"
import { contactInfoContent } from "@/content/contact"

export function ContactInfo() {
  const { phone, email, address, hours } = company.contact
  const { title, labels, stepsTitle, steps } = contactInfoContent

  const items = [
    { icon: Phone, label: labels.phone, value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: Mail, label: labels.email, value: email, href: `mailto:${email}` },
    { icon: MapPin, label: labels.address, value: address },
    { icon: Clock, label: labels.hours, value: hours },
  ]

  return (
    <aside className="grid items-start gap-6 md:grid-cols-2">
      <section aria-labelledby="contact-info-title" className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <h2 id="contact-info-title" className="text-lg font-semibold">
          {title}
        </h2>
        <dl className="mt-5 flex flex-col gap-4">
          {items.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-medium break-words">
                  {href ? (
                    <a href={href} className="underline-offset-4 hover:text-primary hover:underline">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="contact-steps-title" className="rounded-xl bg-muted/50 p-6">
        <h2 id="contact-steps-title" className="text-lg font-semibold">
          {stepsTitle}
        </h2>
        <ol className="mt-5 flex flex-col">
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute top-9 bottom-1 left-4 w-px -translate-x-1/2 bg-border" />
              )}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="pt-1">
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  )
}
