import { ImageResponse } from "next/og"

import { company } from "@/content/company"

export const alt = `${company.nameEn} — ${company.legalName}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// next/og нь CSS token уншихгүй тул брэнд өнгийг энд шууд бичнэ (#003199 = --primary)
const BRAND = "#003199"
const INK = "#0f172a"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #ffffff 0%, #eef2fb 60%, #dfe7fb 100%)",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="110" height="141" viewBox="16 16 290 372">
            <path fill={INK} d="M22 52 80 20 302 150v46L108 322v-60l132-84L82 92l-60 28Z" />
            <path fill={BRAND} d="M22 152 80 124v68l62-36 54 30-110 64v94l22 12-86 32Z" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 0.95 }}>
            <span style={{ color: BRAND }}>Abay</span>
            <span>Pricess</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 700 }}>{company.legalName}</div>
          <div style={{ fontSize: 30, color: "#475569", maxWidth: 940 }}>{company.tagline}</div>
        </div>
        <div style={{ display: "flex", height: 12, width: 240, background: BRAND, borderRadius: 6 }} />
      </div>
    ),
    size
  )
}
