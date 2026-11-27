import { Suspense } from "react"
import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/auth-forms"
import { getSiteContent } from "@/lib/content"
import { safeNext } from "@/lib/auth/schema"

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getSiteContent()).authContent.login
  return { title: t.title, description: t.description, robots: { index: false } }
}

/** `?next=` нь request-time өгөгдөл тул Suspense дотор уншина */
async function LoginContent({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams
  const { authContent } = await getSiteContent()
  return <LoginForm t={authContent} next={safeNext(Array.isArray(next) ? next[0] : next)} />
}

export default async function LoginPage(props: PageProps<"/login">) {
  const t = (await getSiteContent()).authContent.login
  return (
    <section className="py-14 md:py-20">
      <div className="container flex justify-center">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 md:p-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.description}</p>
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />}>
            <LoginContent {...props} />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
