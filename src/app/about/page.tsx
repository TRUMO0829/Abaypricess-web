import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { company } from "@/content/company"

export const metadata: Metadata = { title: "Бидний тухай" }

// TODO(ABAY-1): Байгууллагын танилцуулга, эрхэм зорилго, алсын хараа, үнэт зүйлс
export default function AboutPage() {
  return <PageHeader title="Бидний" highlight="тухай" description={company.intro} breadcrumbs={[{ label: "Бидний тухай" }]} />
}
