"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, LogOut, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authContent as t } from "@/content/auth"
import { logoutAction } from "@/lib/auth/actions"

export interface AccountSummary {
  name: string
  company: string
  position: string
}

/** Толгойн баруун талын нэвтрэх товч / нэвтэрсэн хэрэглэгчийн цэс. */
export function AccountMenu({ account }: { account: AccountSummary | null }) {
  const pathname = usePathname()
  const loginHref = pathname && pathname !== "/" && pathname !== "/login" ? `/login?next=${encodeURIComponent(pathname)}` : "/login"

  if (!account) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href={loginHref} aria-label={t.menu.login}>
          <LogIn data-icon="inline-start" aria-hidden />
          <span className="hidden md:inline">{t.menu.login}</span>
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`${t.menu.account}: ${account.name}`}>
          <UserRound data-icon="inline-start" aria-hidden />
          <span className="hidden max-w-32 truncate md:inline">{account.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-semibold">{account.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {account.position} · {account.company}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <input type="hidden" name="next" value={pathname || "/"} />
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut aria-hidden />
              {t.menu.logout}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
