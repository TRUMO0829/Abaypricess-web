import type { MetadataRoute } from "next"

import { getServiceTabs, services } from "@/content/services"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.9 },
    ...services.flatMap((service) =>
      getServiceTabs(service).map((tab) => ({ path: tab.href, priority: tab.segment ? 0.6 : 0.8 }))
    ),
    { path: "/assessment", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    { path: "/privacy", priority: 0.3 },
  ]

  return pages.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority,
  }))
}
