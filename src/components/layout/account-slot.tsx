import { AccountMenu, type AccountMenuLabels } from "@/components/layout/account-menu"
import { getSessionAccount } from "@/lib/auth/session"

/** Cookie (request-time) уншдаг тул Navbar-д `<Suspense>` дотор байрлана. */
export async function AccountSlot({ labels }: { labels: AccountMenuLabels }) {
  const account = await getSessionAccount()
  return <AccountMenu account={account && { name: account.name, company: account.company, position: account.position }} labels={labels} />
}
