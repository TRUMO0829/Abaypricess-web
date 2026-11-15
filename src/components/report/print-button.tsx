"use client"

import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PrintButton({ label }: { label: string }) {
  return (
    <Button size="lg" onClick={() => window.print()}>
      <Printer data-icon="inline-start" aria-hidden />
      {label}
    </Button>
  )
}
