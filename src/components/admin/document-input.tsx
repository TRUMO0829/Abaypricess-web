"use client"

import { useRef, useState, useTransition } from "react"
import { ExternalLink, FileText, FileUp, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadMediaAction } from "@/lib/admin/actions"

const MAX_BYTES = 4_000_000

/** Үйлчилгээний PDF материал: файл оруулах эсвэл холбоос бичих, нээж харах, хасах. */
export function DocumentInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const upload = (file: File) => {
    setError(null)
    if (file.size > MAX_BYTES) {
      setError("PDF файл 4MB-аас бага байх ёстой. Файлаа шахаж (compress) дахин оролдоно уу.")
      return
    }
    startTransition(async () => {
      const formData = new FormData()
      formData.set("kind", "pdf")
      formData.set("file", file)
      const result = await uploadMediaAction(formData).catch(() => ({ ok: false as const, message: "Файл илгээж чадсангүй. Дахин оролдоно уу." }))
      if (result.ok) onChange(result.url)
      else setError(result.message)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/15 hover:bg-primary/10"
          >
            <FileText className="size-4" aria-hidden /> PDF нээх <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">Файл оруулаагүй</span>
        )}
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => fileRef.current?.click()}>
          {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <FileUp data-icon="inline-start" />}
          {value ? "PDF солих" : "PDF оруулах"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={() => onChange("")}>
            <Trash2 data-icon="inline-start" /> Хасах
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          aria-label="PDF сонгох"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (file) upload(file)
          }}
        />
      </div>
      <Input id={id} value={value} placeholder="эсвэл PDF-ийн холбоос (https://…)" onChange={(event) => onChange(event.target.value)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">4MB хүртэл PDF. Оруулсны дараа доорх «Хадгалах» товчийг дарна.</p>
    </div>
  )
}
