import Link from "next/link"

import { cn } from "@/lib/utils"

// TODO(ABAY-1): docs/brief/logo.png-ийн тэмдгийг inline SVG болгож дахин зурна (dark горимд ч харагдахуйц)
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-heading text-xl leading-none font-bold", className)}>
      <span className="text-primary">Abay</span>
      <span className="-ml-1">Pricess</span>
      <span className="sr-only">— Абая Прайсэс ХХК, нүүр хуудас</span>
    </Link>
  )
}
