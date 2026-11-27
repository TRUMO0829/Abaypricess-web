import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { ContentEditor } from "@/components/admin/content-editor"
import { requireAdmin } from "@/lib/admin/session"
import { buildContent } from "@/lib/content"
import { defaultContent } from "@/lib/content/defaults"
import { toPlain } from "@/lib/content/rules"
import { contentSections, getContentSection } from "@/lib/content/sections"

// Хэсгийн жагсаалт тогтмол тул shell нь prerender хийгдэнэ (агуулга нь нэвтэрсний дараа, Suspense дотор)
export function generateStaticParams() {
  return contentSections.map((section) => ({ section: section.key }))
}

export async function generateMetadata({ params }: PageProps<"/admin/content/[section]">): Promise<Metadata> {
  const { section } = await params
  return { title: getContentSection(section)?.title ?? "Агуулга" }
}

export default async function AdminContentPage({ params }: PageProps<"/admin/content/[section]">) {
  const { section: sectionKey } = await params
  const section = getContentSection(sectionKey)
  if (!section) notFound()

  const { store } = await requireAdmin()
  // Cache-гүй: хамгийн сүүлд хадгалсан утгыг засна
  const rows = await store.readContent()
  const current = buildContent(rows)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/admin" className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden /> Бүх хэсэг
        </Link>
        <h1 className="text-2xl font-bold">{section.title}</h1>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>
      <ContentEditor
        sectionKey={section.key}
        updatedAt={rows[section.key]?.updated_at ?? null}
        fields={section.fields.map((field) => ({
          key: field.key,
          title: field.title,
          value: toPlain(current[field.key]),
          defaults: toPlain(defaultContent[field.key]),
        }))}
      />
    </div>
  )
}
