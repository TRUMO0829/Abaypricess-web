import Link from "next/link"
import { UserRoundCheck } from "lucide-react"

import { RequestForm } from "@/components/contact/request-form"
import { authContent } from "@/content/auth"
import { getSessionAccount } from "@/lib/auth/session"

const t = authContent

/** "99112233" → "9911 2233" */
const formatPhone = (phone: string) => phone.replace(/^(\d{4})(\d{4})$/, "$1 $2")

/** Нэвтэрсэн бол бүртгэлийн 4 мэдээллээр маягтыг бөглөнө. Cookie уншдаг тул `<Suspense>` дотор. */
export async function RequestFormSection() {
  const account = await getSessionAccount()
  return (
    <div className="flex flex-col gap-3">
      {account ? (
        <p className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm ring-1 ring-primary/20">
          <UserRoundCheck className="size-4 shrink-0 text-primary" aria-hidden />
          {t.request.signedIn(account.name)}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t.request.guest}{" "}
          <Link href="/login?next=/contact" className="font-medium text-primary underline-offset-4 hover:underline">
            {t.menu.login}
          </Link>
          {" · "}
          <Link href="/register?next=/contact" className="font-medium text-primary underline-offset-4 hover:underline">
            {t.register.title}
          </Link>
        </p>
      )}
      {/* Нэвтрэх/гарахад маягтыг шинээр үүсгэж, өмнөх хэрэглэгчийн мэдээлэл үлдэхгүй */}
      <RequestForm
        key={account?.id ?? "guest"}
        prefill={
          account
            ? { name: account.name, organization: account.company, position: account.position, phone: formatPhone(account.phone) }
            : undefined
        }
      />
    </div>
  )
}
