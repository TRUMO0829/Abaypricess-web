import type { Metadata } from "next"

import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { BrandLogo } from "@/components/layout/logo"

export const metadata: Metadata = { title: "Нэвтрэх" }

export default function AdminLoginPage() {
  return (
    <section className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 md:p-8">
        <div className="flex flex-col gap-3">
          <BrandLogo className="h-9" />
          <h1 className="text-xl font-bold">Админы хэсэг</h1>
          <p className="text-sm text-muted-foreground">Вебсайтын текст, багийн мэдээлэл, харилцагчдыг удирдах.</p>
        </div>
        <AdminLoginForm />
      </div>
    </section>
  )
}
