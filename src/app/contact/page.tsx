import { Suspense } from "react"
import type { Metadata } from "next"

import { ContactInfo } from "@/components/contact/contact-info"
import { RequestForm } from "@/components/contact/request-form"
import { RequestFormSkeleton } from "@/components/contact/request-form-skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { contactPage } from "@/content/contact"

export const metadata: Metadata = { title: "Холбоо барих", description: contactPage.description }

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title={contactPage.title}
        description={contactPage.description}
        breadcrumbs={[{ label: "Холбоо барих" }]}
      />
      <section className="py-14 md:py-20">
        <div className="container grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
          {/* useSearchParams (?service=&package=) нь runtime өгөгдөл тул Suspense шаардлагатай */}
          <Suspense fallback={<RequestFormSkeleton />}>
            <RequestForm />
          </Suspense>
          <ContactInfo />
        </div>
      </section>
    </>
  )
}
