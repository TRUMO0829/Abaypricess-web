import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Тайлангийн загвар" }

// TODO(ABAY-3): A4 тайлангийн preview, үйлчилгээ тус бүрийн tab, print
export default function ReportPage() {
  return (
    <PageHeader
      title="Тайлангийн"
      highlight="загвар"
      description="Үйлчилгээ бүрийн төгсгөлд хүлээлгэн өгөх тайлангийн бүтэцтэй танилцана уу."
      breadcrumbs={[{ label: "Тайлангийн загвар" }]}
    />
  )
}
