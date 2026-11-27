import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { default: "Админ", template: "%s | Админ" },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-dvh bg-muted/40">{children}</div>
}
