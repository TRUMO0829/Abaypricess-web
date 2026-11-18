// Google Calendar-ын refresh token авах нэг удаагийн script (docs/BOOKING.md, 5-р алхам).
// Ажиллуулах: GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/google-calendar-token.mjs
import { randomUUID } from "node:crypto"
import http from "node:http"

const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret } = process.env
if (!clientId || !clientSecret) {
  console.error("GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET орчны хувьсагчийг тохируулаад дахин ажиллуулна уу.")
  process.exit(1)
}

const port = 53682
const redirectUri = `http://127.0.0.1:${port}`
const state = randomUUID()
const scope = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
].join(" ")

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
    state,
  })

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", redirectUri)
  const code = url.searchParams.get("code")
  if (url.searchParams.get("state") !== state || !code) {
    res.writeHead(400).end("Буруу хүсэлт. Script-ийг дахин ажиллуулна уу.")
    return
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })
  const json = await tokenRes.json()

  if (!tokenRes.ok || !json.refresh_token) {
    console.error("Token авч чадсангүй:", json)
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" }).end("Алдаа гарлаа. Terminal-ыг харна уу.")
  } else {
    console.log("\nGOOGLE_REFRESH_TOKEN=" + json.refresh_token + "\n")
    console.log("Энэ утгыг .env.local болон Vercel-ийн Environment Variables-д нууцаар хадгална уу.")
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" }).end("Амжилттай. Энэ цонхыг хааж, terminal руу буцна уу.")
  }
  server.close()
})

server.listen(port, "127.0.0.1", () => {
  console.log("Календарь эзэмшигчийн Google бүртгэлээр доорх холбоосоор нэвтэрч зөвшөөрнө үү:\n")
  console.log(authUrl + "\n")
})
