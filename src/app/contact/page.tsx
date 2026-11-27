import { Suspense } from "react"
import type { Metadata } from "next"

import { ContactInfo } from "@/components/contact/contact-info"
import { RequestFormSection } from "@/components/contact/request-form-section"
import { RequestFormSkeleton } from "@/components/contact/request-form-skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { getSiteContent } from "@/lib/content"

export async function generateMetadata(): Promise<Metadata> {
  const { contactPage } = await getSiteContent()
  return { title: "Холбоо барих", description: contactPage.description }
}

export default async function ContactPage() {
  const { contactPage } = await getSiteContent()
  return (
    <>
      <PageHeader
        title={contactPage.title}
        description={contactPage.description}
        breadcrumbs={[{ label: "Холбоо барих" }]}
      />
      <section className="py-14 md:py-20">
        <div className="container flex flex-col gap-8 lg:gap-12">
          {/* useSearchParams (?service=&package=) болон нэвтрэлтийн cookie нь runtime өгөгдөл тул Suspense шаардлагатай */}
          <Suspense fallback={<RequestFormSkeleton />}>
            <RequestFormSection />
          </Suspense>
          <ContactInfo />
        </div>
      </section>
    </>
  )
}
