/** /services/[slug] навигацийн үед ServiceHeader-ийн хэмжээтэй placeholder. */
export function ServiceHeaderSkeleton() {
  return (
    <section aria-busy="true" aria-label="Ачаалж байна" className="border-b bg-muted/40">
      <div className="container flex animate-pulse flex-col gap-6 pt-12 motion-reduce:animate-none md:pt-16">
        <div className="h-4 w-56 rounded bg-muted" />
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-xl bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
        </div>
        <div className="h-10 w-full max-w-xl rounded bg-muted md:h-12" />
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-lg bg-muted" />
          <div className="h-10 w-40 rounded-lg bg-muted" />
        </div>
        <div className="flex gap-4 pb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-5 w-20 rounded bg-muted" />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Дэд хуудасны агуулгын placeholder. */
export function ServiceContentSkeleton() {
  return (
    <div aria-busy="true" aria-label="Ачаалж байна" className="container flex animate-pulse flex-col items-center gap-6 py-16 motion-reduce:animate-none md:py-20">
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="h-9 w-full max-w-md rounded bg-muted" />
      <div className="mt-6 h-64 w-full rounded-xl bg-card ring-1 ring-foreground/10" />
    </div>
  )
}
