"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { applyTheme } from "@/lib/theme"

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

export function ModeToggle() {
  const isDark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false
  )

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Гэрэлт горим руу шилжих" : "Харанхуй горим руу шилжих"}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
