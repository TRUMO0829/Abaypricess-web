import { ImageResponse } from "next/og"

import { company } from "@/content/company"
import { brandHex, logoMark } from "@/lib/brand"

export const alt = `${company.nameEn} — ${company.legalName}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const { primary: BRAND, ink: INK } = brandHex
const [firstWord, ...restWords] = company.nameEn.split(" ")

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
          <svg width="140" height="140" viewBox={logoMark.viewBox}>
            <path fill={INK} d={logoMark.ink} />
            <path fill={BRAND} d={logoMark.accent} />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 0.95 }}>
            <span style={{ color: BRAND }}>{firstWord}</span>
            <span>{restWords.join(" ")}</span>
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
