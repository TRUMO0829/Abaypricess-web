import type { Metadata } from "next"

import { AccountsTable } from "@/components/admin/accounts-table"
import { requireAdmin } from "@/lib/admin/session"

export const metadata: Metadata = { title: "Харилцагчид" }

export default async function AdminUsersPage() {
  const { store, token } = await requireAdmin()
  let accounts: Awaited<ReturnType<typeof store.listAccounts>> = []
  let failed = false
  try {
    accounts = await store.listAccounts(token)
  } catch (error) {
    console.error("[admin] accounts", error)
    failed = true
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Харилцагчид</h1>
        <p className="text-sm text-muted-foreground">Вебсайт дээр бүртгүүлж, нэвтэрсэн хэрэглэгчид. Нууц үг харагдахгүй (шифрлэгдсэн).</p>
      </div>
      {failed ? (
        <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          Харилцагчдын жагсаалтыг ачаалж чадсангүй. Дахин нэвтэрч оролдоно уу.
        </p>
      ) : (
        <AccountsTable accounts={accounts} />
      )}
    </div>
  )
}
