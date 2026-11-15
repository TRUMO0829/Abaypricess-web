/** `RequestForm` ачаалагдах хүртэлх Suspense fallback (useSearchParams нь runtime өгөгдөл). */
export function RequestFormSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Маягт ачаалж байна"
      className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 md:p-8"
    >
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 animate-pulse rounded-lg bg-muted" />
          </div>
        ))}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}
