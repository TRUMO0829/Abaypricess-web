import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import { cache } from "react"

import { getAdminStore, type ContentRows } from "@/lib/admin/store"
import { defaultContent, type ContentKey } from "@/lib/content/defaults"
import { merge } from "@/lib/content/merge"
import { contentSections } from "@/lib/content/sections"
import type { NavItem, ServiceSlug, TeamMember } from "@/types/content"

export const CONTENT_TAG = "site-content"

type Defaults = typeof defaultContent

export type RequestServiceOption = ServiceSlug | "other"

export interface SiteContent extends Defaults {
  /** Хүсэлтийн маягтын «Үйлчилгээ» сонголт */
  serviceOptions: { value: RequestServiceOption; label: string }[]
  /** «Уулзах хүн»-д сонгогдох багийн гишүүд (id-тай) */
  meetingHosts: (TeamMember & { id: string })[]
}

/** Хадгалсан мөрүүдийг default дээр давхарлана (cache-гүй — админы засварын хуудсанд). */
export function buildContent(rows: ContentRows): SiteContent {
  const merged = { ...defaultContent } as Record<ContentKey, unknown>
  for (const section of contentSections) {
    const data = rows[section.key]?.data
    if (!data || typeof data !== "object") continue
    for (const field of section.fields) {
      const override = (data as Record<string, unknown>)[field.key]
      if (override !== undefined) merged[field.key] = merge(defaultContent[field.key], override, [field.key])
    }
  }
  const content = merged as Defaults

  // Бусад утгаас бүрддэг хэсгүүд
  const servicesNav = content.mainNav.find((item) => item.href === "/services")?.children ?? []
  const footerNav = { ...content.footerNav, services: { ...content.footerNav.services, items: servicesNav as NavItem[] } }

  return {
    ...content,
    footerNav,
    serviceOptions: [
      ...content.services.map((service) => ({ value: service.slug as RequestServiceOption, label: service.name })),
      { value: "other", label: content.requestFormContent.otherService },
    ],
    meetingHosts: content.team.filter((member): member is TeamMember & { id: string } => Boolean(member.id)),
  }
}

/** Админы хадгалсан мөрүүд (JSON). Cache-тэй; админ хадгалахад `updateTag(CONTENT_TAG)`. */
async function getContentRows(): Promise<ContentRows> {
  "use cache"
  cacheTag(CONTENT_TAG)
  cacheLife("days")
  return (await getAdminStore()?.readContent().catch(() => ({}))) ?? {}
}

/**
 * Сайтын бүх текст (кодын default + админы засвар). Icon агуулдаг тул cache-д биш, хүсэлт бүрт нэг удаа нийлүүлнэ.
 * Server Component, Server Action-д л дуудна. Client component руу хэрэгтэй хэсгийг нь props-оор дамжуулна.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => buildContent(await getContentRows()))
