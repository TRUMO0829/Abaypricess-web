import Image from "next/image"
import { Mail, Phone } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { cvLabels } from "@/content/team"
import { cn } from "@/lib/utils"
import type { TeamMember } from "@/types/content"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

function CvList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-xs font-semibold tracking-wide text-primary uppercase">{label}</h4>
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-primary/60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Багийн гишүүн, сургагч багшийн карт: зураг, нэр, албан тушаал, задардаг CV. */
/** CV-ийн шошго (админы засвар орсон `getSiteContent().cvLabels`) */
export type CvLabels = typeof cvLabels

function PersonCard({ person, id, t }: { person: TeamMember; id: string; t: CvLabels }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="relative flex aspect-video items-center justify-center bg-linear-to-br from-primary/15 to-primary/5 md:aspect-[4/3]">
        {person.photo ? (
          <Image
            src={person.photo}
            alt={person.name}
            fill
            // Гаднын холбоос болон админаас оруулсан (аль хэдийн багасгасан) зургийг optimize хийхгүй
            unoptimized={!person.photo.startsWith("/") || person.photo.startsWith("/media/")}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span aria-hidden className="font-heading text-4xl font-bold text-primary/70">
            {initials(person.name)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold">{person.name}</h3>
        <p className="text-sm font-medium text-primary">{person.role}</p>
        <p className="text-sm text-muted-foreground md:min-h-[4lh]">{person.summary}</p>
      </div>
      <Accordion type="single" collapsible className="mt-auto border-t px-5">
        <AccordionItem value={id} className="border-b-0">
          <AccordionTrigger className="text-sm">{t.cv}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <CvList label={t.experience} items={person.experience} />
            <CvList label={t.expertise} items={person.expertise} />
            {(person.phone || person.email) && (
              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs font-semibold tracking-wide text-primary uppercase">{t.contact}</h4>
                <ul className="flex flex-col gap-1 text-sm">
                  {person.phone && (
                    <li>
                      <a
                        href={`tel:${person.phone.replace(/\s/g, "")}`}
                        aria-label={`${t.phone}: ${person.phone}`}
                        className="inline-flex items-center gap-2 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        <Phone className="size-3.5 shrink-0 text-primary" aria-hidden />
                        {person.phone}
                      </a>
                    </li>
                  )}
                  {person.email && (
                    <li>
                      <a
                        href={`mailto:${person.email}`}
                        aria-label={`${t.email}: ${person.email}`}
                        className="inline-flex items-center gap-2 break-all text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        <Mail className="size-3.5 shrink-0 text-primary" aria-hidden />
                        {person.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </li>
  )
}

export function PersonGrid({ people, labels, className }: { people: TeamMember[]; labels: CvLabels; className?: string }) {
  return (
    <ul className={cn("grid items-start gap-6 md:grid-cols-2 lg:grid-cols-4", className)}>
      {people.map((person, index) => (
        <PersonCard key={person.id ?? index} person={person} id={`cv-${index}`} t={labels} />
      ))}
    </ul>
  )
}
