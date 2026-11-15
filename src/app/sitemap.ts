import type { MetadataRoute } from "next"

import { services } from "@/content/services"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/services", priority: 0.9 },
    ...services.map((service) => ({ path: `/services/${service.slug}`, priority: 0.8 })),
    { path: "/report", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
  ]

  return pages.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority,
  }))
}
