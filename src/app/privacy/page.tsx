import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { getSiteContent } from "@/lib/content"

export async function generateMetadata(): Promise<Metadata> {
  const { privacyPolicy: t } = await getSiteContent()
  return { title: t.title, description: t.intro }
}

export default async function PrivacyPage() {
  const { company, privacyPolicy: t } = await getSiteContent()
  return (
    <>
      <PageHeader title={t.title} breadcrumbs={[{ label: t.title }]} />
      <section className="py-14 md:py-20">
        <article className="container flex max-w-3xl flex-col gap-8">
          <p className="text-sm text-muted-foreground">
            {t.updatedLabel}: <time dateTime={t.updated}>{t.updated}</time>
          </p>
          <p className="text-pretty text-muted-foreground">{t.intro}</p>
          {t.sections.map((section) => (
            <section key={`${section.title}-${section.items.length}`} className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="flex list-disc flex-col gap-2 ps-5 text-pretty text-muted-foreground marker:text-primary">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">{t.contactTitle}</h2>
            <p className="text-muted-foreground">{t.contactText}</p>
            <p>
              <a href={`mailto:${company.contact.email}`} className="font-medium text-primary underline-offset-4 hover:underline">
                {company.contact.email}
              </a>
              <span className="text-muted-foreground"> · {company.contact.phone}</span>
            </p>
          </section>
        </article>
      </section>
    </>
  )
}
