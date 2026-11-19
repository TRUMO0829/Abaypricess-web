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
  await page.goto("/services/update/pricing")
  const cta = page.locator("#pricing a[href^='/contact']").first()
  await expect(cta).toHaveAttribute("href", "/contact?service=update&package=focus")
})

test.describe("Үйлчилгээний цэс (1 мэдээлэл = 1 хуудас)", () => {
  test("tab бүр өөрийн хуудсыг нээж, идэвхтэй tab шилжинэ", async ({ page }) => {
    await page.goto("/services/training")
    const tabs = page.getByRole("navigation", { name: "Үйлчилгээний цэс" })
    await expect(tabs.getByRole("link")).toHaveText(["Тойм", "Хөтөлбөр", "Сургагч багш", "Үнийн санал", "Тайлан", "Үнэлгээний асуулт"])
    await expect(tabs.getByRole("link", { name: "Тойм" })).toHaveAttribute("aria-current", "page")

    await tabs.getByRole("link", { name: "Тайлан" }).click()
    await expect(page).toHaveURL(/\/services\/training\/report$/)
    await expect(tabs.getByRole("link", { name: "Тайлан" })).toHaveAttribute("aria-current", "page")
    await expect(page.getByRole("article", { name: "Сургалтын үр дүнгийн тайлан" })).toBeVisible()
  })

  test("Үнийн санал үзэх товч үнийн саналын хуудас руу очно", async ({ page }) => {
    await page.goto("/services/laboratory")
    await page.getByRole("link", { name: "Үнийн санал үзэх" }).click()
    await expect(page).toHaveURL(/\/services\/laboratory\/pricing$/)
    await expect(page.locator("#pricing")).toBeVisible()
  })

  test("сургалтын багш нарын CV задарна", async ({ page }) => {
    await page.goto("/services/training/trainers")
    const triggers = page.locator("#trainers").getByRole("button", { name: "CV харах" })
    await expect(triggers).toHaveCount(3)
    await triggers.first().click()
    await expect(triggers.first()).toHaveAttribute("aria-expanded", "true")
  })

  test("багш, хөтөлбөргүй үйлчилгээнд тэдгээр tab, хуудас байхгүй", async ({ page }) => {
    await page.goto("/services/laboratory")
    const tabs = page.getByRole("navigation", { name: "Үйлчилгээний цэс" })
    await expect(tabs.getByRole("link", { name: "Сургагч багш" })).toHaveCount(0)
    await page.goto("/services/laboratory/trainers")
    expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0)
  })
})
