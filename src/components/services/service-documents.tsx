import { Download, FileText } from "lucide-react"

import type { ServiceDocument } from "@/types/content"

/** Админаас оруулсан PDF материалын жагсаалт. Файлгүй мөрийг харуулахгүй. */
export function ServiceDocuments({ title, openLabel, documents }: { title: string; openLabel: string; documents: ServiceDocument[] }) {
  // Зөвхөн дотоод (/media/…) эсвэл http(s) холбоос
  const items = documents.filter((doc) => typeof doc.file === "string" && /^(\/(?!\/)|https?:\/\/)/.test(doc.file.trim()))
  if (items.length === 0) return null
  return (
    <section aria-labelledby="service-documents" className="mx-auto flex w-full max-w-3xl flex-col gap-4 print:hidden">
      <h2 id="service-documents" className="text-lg font-semibold">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((doc) => (
          <li key={doc.id}>
            <a
              href={doc.file}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors outline-none hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 font-medium text-pretty break-words">{doc.title || "PDF"}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-primary">
                <Download className="size-4" aria-hidden />
                <span className="hidden sm:inline">{openLabel}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
