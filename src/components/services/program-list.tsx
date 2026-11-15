import { Clock, MonitorSmartphone } from "lucide-react"

import type { Program } from "@/types/content"

export function ProgramList({ programs }: { programs: Program[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {programs.map((program) => (
        <li key={program.id} className="flex flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg leading-snug font-semibold">{program.title}</h3>
            <p className="text-sm text-muted-foreground">{program.description}</p>
          </div>
          <ul className="flex flex-1 flex-col gap-2 text-sm" aria-label="Сэдвүүд">
            {program.topics.map((topic) => (
              <li key={topic} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {topic}
              </li>
            ))}
          </ul>
          <dl className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary" aria-hidden />
              <dt className="sr-only">Хугацаа</dt>
              <dd>{program.duration}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <MonitorSmartphone className="size-4 text-primary" aria-hidden />
              <dt className="sr-only">Хэлбэр</dt>
              <dd>{program.format}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}
