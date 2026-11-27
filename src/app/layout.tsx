import { Suspense } from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"

import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { SiteChrome } from "@/components/layout/site-chrome"
import { getSiteContent } from "@/lib/content"
import { themeScript } from "@/lib/theme"
import "./globals.css"

// cyrillic-ext нь монгол Ө, Ү үсгийг агуулна
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
})

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
})

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await getSiteContent()
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: `${company.legalName} — ${company.tagline}`,
      template: `%s | ${company.name}`,
    },
    description: company.intro,
  }
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="mn"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* contents: sticky header-ийг эвдэхгүйгээр хэвлэх үед нуух */}
        {/* SiteChrome нь URL уншдаг тул Suspense дотор (тодорхой route-д static shell-д багтана) */}
        <Suspense>
          <SiteChrome>
            <div className="contents print:hidden">
              <Navbar />
            </div>
          </SiteChrome>
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense>
          <SiteChrome>
            <div className="contents print:hidden">
              <Footer />
            </div>
          </SiteChrome>
        </Suspense>
      </body>
    </html>
  )
}
