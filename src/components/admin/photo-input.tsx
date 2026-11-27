"use client"

import { useRef, useState, useTransition } from "react"
import { ImageUp, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadMediaAction } from "@/lib/admin/actions"

const MAX_SIDE = 800

/** Зургийг 800px хүртэл багасгаж JPEG болгоно (Server Action-ий 1MB хязгаарт багтаана). */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext("2d")
  if (!context) throw new Error("canvas")
  context.fillStyle = "#fff"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/jpeg", 0.85))
}

/** Хүний картын зураг: файл оруулах эсвэл холбоос бичих, урьдчилж харах, устгах. */
export function PhotoInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const upload = (file: File) =>
    startTransition(async () => {
      setError(null)
      let blob: Blob
      try {
        blob = await shrink(file)
      } catch {
        setError("Энэ зургийг уншиж чадсангүй. JPG эсвэл PNG зураг сонгоно уу.")
        return
      }
      const formData = new FormData()
      formData.set("file", blob, "photo.jpg")
      const result = await uploadMediaAction(formData)
      if (result.ok) onChange(result.url)
      else setError(result.message)
    })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs text-muted-foreground ring-1 ring-foreground/10">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- админы урьдчилсан харагдац, холбоос дурын байж болно
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            "Зураггүй"
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => fileRef.current?.click()}>
            {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <ImageUp data-icon="inline-start" />}
            {value ? "Зураг солих" : "Зураг оруулах"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={() => onChange("")}>
              <Trash2 data-icon="inline-start" /> Зураг хасах
            </Button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          aria-label="Зураг сонгох"
          data-testid={`${id}-file`}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (file) upload(file)
          }}
        />
      </div>
      <Input id={id} value={value} placeholder="эсвэл зургийн холбоос (https://…)" onChange={(event) => onChange(event.target.value)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Зураг оруулсны дараа доорх «Хадгалах» товчийг дарна.</p>
    </div>
  )
}
