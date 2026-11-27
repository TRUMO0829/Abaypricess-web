import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Users } from "lucide-react"

import { requireAdmin } from "@/lib/admin/session"
import { contentSections } from "@/lib/content/sections"

export const metadata: Metadata = { title: "Агуулга" }

export default async function AdminHomePage() {
  const { store } = await requireAdmin()
  const rows = await store.readContent()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Вебсайтын агуулга</h1>
        <p className="text-sm text-muted-foreground">Хэсгээ сонгоод текстээ засна. Хадгалмагц вебсайт дээр шууд шинэчлэгдэнэ.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contentSections.map((section) => {
          const updated = rows[section.key]?.updated_at
          return (
            <li key={section.key}>
              <Link
                href={`/admin/content/${section.key}`}
                className="group flex h-full flex-col gap-2 rounded-xl bg-card p-5 ring-1 ring-foreground/10 outline-none transition hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex items-center justify-between gap-2 font-semibold">
                  {section.title}
                  <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden />
                </span>
                <span className="text-sm text-pretty text-muted-foreground">{section.description}</span>
                <span className="mt-auto pt-2 text-xs text-muted-foreground">
                  {updated ? `Засварласан: ${new Date(updated).toISOString().slice(0, 10)}` : "Анхны текст"}
                </span>
              </Link>
            </li>
          )
        })}
        <li>
          <Link
            href="/admin/users"
            className="group flex h-full flex-col gap-2 rounded-xl bg-primary/5 p-5 ring-1 ring-primary/20 outline-none transition hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex items-center gap-2 font-semibold text-primary">
              <Users className="size-4" aria-hidden /> Харилцагчид
            </span>
            <span className="text-sm text-muted-foreground">Вебсайт дээр бүртгүүлсэн хэрэглэгчдийн нэр, компани, албан тушаал, утас.</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
