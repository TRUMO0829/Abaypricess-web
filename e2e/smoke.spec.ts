import { expect, test } from "@playwright/test"

const routes = [
  "/",
  "/services",
  "/services/training",
  "/services/laboratory",
  "/services/update",
  "/services/training/programs",
  "/services/training/trainers",
  "/services/training/pricing",
  "/services/training/report",
  "/services/training/faq",
  "/services/update/report",
  "/contact",
]

for (const route of routes) {
  test(`${route} ачаалагдаж, хэвтээ scroll гарахгүй`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))

    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.locator("h1").first()).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute("lang", "mn")

    // isMobile үед layout viewport агуулгын өргөнд тэлдэг тул тохируулсан viewport-той харьцуулна
    const viewportWidth = page.viewportSize()!.width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth)
    expect(errors).toEqual([])
  })
}

test("тайлангийн загвар вебээс хасагдсан", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator('a[href="/report"]')).toHaveCount(0)
  await expect(page.locator('a[href="/about"]')).toHaveCount(0)
  await page.goto("/report")
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0)
})

test("нүүрэнд тоон үзүүлэлт, диаграммын эхлэх/дуусах, дугаар байхгүй", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Тоон үзүүлэлт")).toHaveCount(0)
  const flow = page.locator("#process")
  await expect(flow.getByText(/^(Эхлэх|Дуусах)$/)).toHaveCount(0)
  await expect(flow.locator("li:visible")).toHaveCount(3)
})

test("нүүр: багийн гишүүд, CV задарна", async ({ page }) => {
  await page.goto("/")
  const team = page.locator("#team")
  const triggers = team.getByRole("button", { name: "CV харах" })
  await expect(triggers).toHaveCount(4)
  const trigger = triggers.first()
  await trigger.click()
  await expect(trigger).toHaveAttribute("aria-expanded", "true")
  await expect(team.getByText("Боловсрол").first()).toBeVisible()
})

test("тодорхойгүй үйлчилгээ not-found харуулна", async ({ page }) => {
  await page.goto("/services/does-not-exist")
  // Streaming-ийн улмаас noindex meta 1-ээс олон удаа гарч болно
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0)
})
