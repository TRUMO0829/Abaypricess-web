import { Suspense } from "react"
import Link from "next/link"
import { ExternalLink, LogOut } from "lucide-react"

import { AdminNav } from "@/components/admin/admin-nav"
import { BrandLogo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { adminLogoutAction } from "@/lib/admin/actions"
import { requireAdmin } from "@/lib/admin/session"

/** Cookie шалгадаг тул Suspense дотор. Нэвтрээгүй бол /admin/login руу. */
async function Guard({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return children
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-2 sm:gap-4">
          <Link href="/admin" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <BrandLogo className="h-6 sm:h-7" />
            <span className="hidden text-sm font-semibold text-muted-foreground sm:inline">Админ</span>
          </Link>
          <Suspense>
            <AdminNav />
          </Suspense>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button asChild variant="ghost" size="sm" aria-label="Вебсайт">
              <Link href="/" target="_blank">
                <ExternalLink data-icon="inline-start" aria-hidden />
                <span className="hidden sm:inline">Вебсайт</span>
              </Link>
            </Button>
            <form action={adminLogoutAction}>
              <Button type="submit" variant="ghost" size="sm" aria-label="Гарах">
                <LogOut data-icon="inline-start" aria-hidden />
                <span className="hidden sm:inline">Гарах</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />}>
          <Guard>{children}</Guard>
        </Suspense>
      </main>
    </>
  )
}
