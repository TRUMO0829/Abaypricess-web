import { PlayCircle } from "lucide-react"

import { cn } from "@/lib/utils"

/** YouTube холбоосоос бичлэгийн id-г гаргана: watch?v=, youtu.be/, embed/, shorts/, live/. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\.|^m\./, "")
    let id: string | null = null
    if (host === "youtu.be") id = u.pathname.slice(1)
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? null
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

interface IntroVideoProps {
  url: string
  title: string
  placeholder: string
  className?: string
}

/** Танилцуулга бичлэг (youtube-nocookie, lazy). Холбоос байхгүй/буруу бол түр зураг. */
export function IntroVideo({ url, title, placeholder, className }: IntroVideoProps) {
  const id = url ? youtubeId(url) : null
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl border bg-card", className)}>
      {id ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 bg-linear-to-br from-primary/15 to-primary/5 text-muted-foreground">
          <PlayCircle className="size-14 text-primary/70" aria-hidden />
          <p className="text-sm">{placeholder}</p>
        </div>
      )}
    </div>
  )
}
