import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Үйлчилгээ" }

// TODO(ABAY-2): 3 үйлчилгээний тойм + нийт урсгал
export default function ServicesPage() {
  return (
    <PageHeader
      title="Манай"
      highlight="үйлчилгээ"
      description="Сургалт, лаборатори, шинэчлэл — байгууллагын хөгжлийн бүрэн мөчлөг."
      breadcrumbs={[{ label: "Үйлчилгээ" }]}
    />
  )
}
