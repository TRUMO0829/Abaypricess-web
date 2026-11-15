import { expect, test } from "@playwright/test"

const routes = [
  "/",
  "/about",
  "/services",
  "/services/training",
  "/services/laboratory",
  "/services/update",
  "/report",
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

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
    expect(errors).toEqual([])
  })
}

test("тодорхойгүй үйлчилгээ not-found харуулна", async ({ page }) => {
  await page.goto("/services/does-not-exist")
  // Streaming-ийн улмаас noindex meta 1-ээс олон удаа гарч болно
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0)
})
