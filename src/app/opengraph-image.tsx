import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { company as defaultCompany } from "@/content/company"
import { getSiteContent } from "@/lib/content"
import { brandHex, brandLogo } from "@/lib/brand"

export const alt = `${defaultCompany.nameEn} — ${defaultCompany.legalName}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const logoData = await readFile(join(process.cwd(), "public", brandLogo.src), "base64")
const logoSrc = `data:image/png;base64,${logoData}`
const LOGO_WIDTH = 520

export default async function OpengraphImage() {
  const { company } = await getSiteContent()
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
          background: "linear-gradient(135deg, #ffffff 0%, #f4f0fa 60%, #e9e1f7 100%)",
          color: brandHex.ink,
        }}
      >
        <img
          src={logoSrc}
          alt=""
          width={LOGO_WIDTH}
          height={Math.round((LOGO_WIDTH * brandLogo.height) / brandLogo.width)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 700 }}>{company.legalName}</div>
          <div style={{ fontSize: 30, color: brandHex.muted, maxWidth: 940 }}>{company.tagline}</div>
        </div>
        <div style={{ display: "flex", height: 12, width: 240, background: brandHex.primary, borderRadius: 6 }} />
      </div>
    ),
    size
  )
}
