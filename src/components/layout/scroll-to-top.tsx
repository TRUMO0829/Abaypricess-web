"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ScrollToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <Button
      size="icon"
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-4 bottom-4 z-30 rounded-full shadow-lg transition-all duration-300 md:right-6 md:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp />
    </Button>
  )
}
