import { company } from "@/content/company"
import { cn } from "@/lib/utils"

export function ValuesGrid({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {company.values.map(({ icon: Icon, title, description }) => (
        <li key={title} className="group flex flex-col gap-3 rounded-2xl border bg-card p-6 transition-colors hover:border-primary/50">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-5" aria-hidden />
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-pretty text-muted-foreground">{description}</p>
        </li>
      ))}
    </ul>
  )
}
