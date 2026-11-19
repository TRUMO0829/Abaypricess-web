import { defineConfig, devices } from "@playwright/test"

const PORT = 3200

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Систем дээр суусан Google Chrome-ийг ашиглана (browser татахгүй)
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome", viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    // Цаг захиалгыг Google-гүйгээр туршилтын календараар шалгана
    // .env.local-д бодит түлхүүр байсан ч тест Google/Supabase руу хандахгүй
    env: { BOOKING_MOCK: "1", ASSESSMENT_MOCK: "1", ZOOM_MEETING_URL: "https://zoom.us/j/1234567890",
      AUTH_MOCK: "1",
      AUTH_SECRET: "e2e-only-auth-secret-0123456789abcdef",
    },
  },
})
