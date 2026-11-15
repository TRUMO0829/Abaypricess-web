import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  /** Гарчгийн төгсгөлд primary gradient-ээр тодруулах хэсэг */
  highlight?: string
  description?: string
  align?: "center" | "start"
  as?: "h1" | "h2"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-3",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-start",
        className
      )}
    >
      {eyebrow && (
        <span className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</span>
      )}
      <Heading className="text-3xl font-bold text-balance md:text-4xl">
        {title}
        {highlight && (
          <>
            {" "}
            <span className="bg-linear-to-b from-primary/70 to-primary bg-clip-text text-transparent">
              {highlight}
            </span>
          </>
        )}
      </Heading>
      {description && (
        <p className="text-lg text-pretty text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
