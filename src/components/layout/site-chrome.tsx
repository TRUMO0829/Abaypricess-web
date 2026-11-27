"use client"

import { usePathname } from "next/navigation"

/** Админы хэсэгт сайтын толгой, footer харагдахгүй. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null
  return children
}
