"use client"

import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface AccountRow {
  id: string
  created_at: string
  name: string
  company: string
  position: string
  phone: string
  last_login_at: string | null
}

/** Цагийн бүсээс үл хамааран server/client-д ижил: "2026-11-27 14:05" (Улаанбаатар) */
function formatDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(new Date(value).getTime() + 8 * 3600_000)
  return date.toISOString().slice(0, 16).replace("T", " ")
}

const formatPhone = (phone: string) => phone.replace(/^(\d{4})(\d{4})$/, "$1 $2")

function downloadCsv(rows: AccountRow[]) {
  const header = ["Нэр", "Компани", "Албан тушаал", "Утас", "Бүртгүүлсэн", "Сүүлд нэвтэрсэн"]
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = [header, ...rows.map((r) => [r.name, r.company, r.position, r.phone, formatDate(r.created_at), formatDate(r.last_login_at)])]
  // BOM — Excel кирилл үсгийг зөв уншина
  const blob = new Blob(["﻿" + lines.map((line) => line.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `adapt-harilcagchid-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AccountsTable({ accounts }: { accounts: AccountRow[] }) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter((a) => [a.name, a.company, a.position, a.phone].some((v) => v.toLowerCase().includes(q)))
  }, [accounts, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Нэр, компани, утсаар хайх"
            aria-label="Харилцагч хайх"
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Нийт {accounts.length}
          {query && ` · олдсон ${filtered.length}`}
        </p>
        <Button type="button" variant="outline" size="sm" className="ml-auto" disabled={filtered.length === 0} onClick={() => downloadCsv(filtered)}>
          <Download data-icon="inline-start" /> Excel (CSV) татах
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Нэр</th>
              <th scope="col" className="px-4 py-3 font-medium">Компани</th>
              <th scope="col" className="px-4 py-3 font-medium">Албан тушаал</th>
              <th scope="col" className="px-4 py-3 font-medium">Утас</th>
              <th scope="col" className="px-4 py-3 font-medium">Бүртгүүлсэн</th>
              <th scope="col" className="px-4 py-3 font-medium">Сүүлд нэвтэрсэн</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {accounts.length === 0 ? "Одоогоор бүртгэлтэй харилцагч алга." : "Хайлтад тохирох харилцагч олдсонгүй."}
                </td>
              </tr>
            ) : (
              filtered.map((account) => (
                <tr key={account.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{account.name}</td>
                  <td className="px-4 py-3">{account.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{account.position}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    <a href={`tel:${account.phone}`} className="hover:text-primary">
                      {formatPhone(account.phone)}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(account.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(account.last_login_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
