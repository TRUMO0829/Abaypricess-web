import { expect, test } from "@playwright/test"

test.describe("ProcessStepper", () => {
  test("desktop: сумаар алхам сонгоно", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop tabs")
    await page.goto("/services/training")
    const tabs = page.getByRole("tab")
    await expect(tabs).toHaveCount(4)
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true")

    await tabs.first().focus()
    await page.keyboard.press("ArrowRight")
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(tabs.nth(1)).toBeFocused()

    await page.getByRole("button", { name: "Дараагийн алхам" }).click()
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true")
  })

  test("mobile: алхмыг задалж, хаана", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile timeline")
    await page.goto("/services/laboratory")
    const second = page.locator("ol button[aria-expanded]").nth(1)
    await expect(second).toHaveAttribute("aria-expanded", "false")
    await second.click()
    await expect(second).toHaveAttribute("aria-expanded", "true")
  })
})

test("багцын CTA нь маягт руу үйлчилгээ, багцтай очно", async ({ page }) => {
  await page.goto("/services/update")
  const cta = page.locator("#pricing a[href^='/contact']").first()
  await expect(cta).toHaveAttribute("href", "/contact?service=update&package=focus")
})
