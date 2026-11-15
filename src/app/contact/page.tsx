import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { contactPage } from "@/content/contact"

export const metadata: Metadata = { title: "Холбоо барих" }

// TODO(ABAY-3): RequestForm (?service=&package= урьдчилж бөглөх), ContactInfo
export default function ContactPage() {
  return <PageHeader title={contactPage.title} description={contactPage.description} breadcrumbs={[{ label: "Холбоо барих" }]} />
}
