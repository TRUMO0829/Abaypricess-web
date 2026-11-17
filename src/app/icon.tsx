import { ImageResponse } from "next/og"

import { brandHex, logoMark } from "@/lib/brand"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 96,
        }}
      >
        <svg width="380" height="380" viewBox={logoMark.viewBox}>
          <path fill={brandHex.ink} d={logoMark.ink} />
          <path fill={brandHex.primary} d={logoMark.accent} />
        </svg>
      </div>
    ),
    size
  )
}
