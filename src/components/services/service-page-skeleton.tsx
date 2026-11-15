/** /services/[slug] навигацийн үед ServiceHero-ийн хэмжээтэй placeholder. */
export function ServicePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Ачаалж байна">
      <section className="border-b bg-muted/40">
        <div className="container flex animate-pulse flex-col gap-8 py-12 motion-reduce:animate-none md:py-16">
          <div className="h-4 w-56 rounded bg-muted" />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </div>
              <div className="h-10 w-full max-w-xl rounded bg-muted md:h-12" />
              <div className="flex max-w-2xl flex-col gap-2">
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
              <div className="flex gap-3">
                <div className="h-9 w-32 rounded-lg bg-muted" />
                <div className="h-9 w-40 rounded-lg bg-muted" />
              </div>
            </div>
            <div className="h-64 rounded-xl bg-card ring-1 ring-foreground/10" />
          </div>
        </div>
      </section>
    </div>
  )
}
