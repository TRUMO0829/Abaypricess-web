import { expect, test } from "@playwright/test"

test.describe("/report тайлангийн загвар", () => {
  test("tab-аар загвар сэлгэнэ", async ({ page }) => {
    await page.goto("/report")
    await expect(page.getByRole("heading", { name: "Сургалтын үр дүнгийн тайлан" })).toBeVisible()
    await page.getByRole("tab", { name: "Лаборатори" }).click()
    await expect(page.getByRole("heading", { name: "Бизнес лабораторийн тайлан" })).toBeVisible()
    await page.getByRole("tab", { name: "Лаборатори" }).press("ArrowRight")
    await expect(page.getByRole("heading", { name: "Шинэчлэлийн үр дүнгийн тайлан" })).toBeVisible()
  })

  test("хэвлэх үед зөвхөн цаас харагдана", async ({ page }) => {
    await page.goto("/report")
    await page.emulateMedia({ media: "print" })
    await expect(page.getByRole("article", { name: "Сургалтын үр дүнгийн тайлан" })).toBeVisible()
    await expect(page.getByRole("tablist")).toBeHidden()
    await expect(page.getByRole("button", { name: "Хэвлэх / PDF болгох" })).toBeHidden()
    await expect(page.locator("h1")).toBeHidden()
    await expect(page.locator("header").first()).toBeHidden()
  })

  test("dark горимд ч цаас цагаан байна", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("abay-theme", "dark"))
    await page.goto("/report")
    await expect(page.locator("html")).toHaveClass(/dark/)
    const paper = page.getByRole("article", { name: "Сургалтын үр дүнгийн тайлан" })
    const background = await paper.evaluate((el) => getComputedStyle(el).backgroundColor)
    // Chrome нь oklch(1 0 0)-г lab(100 0 0) гэж буцаадаг — бүгд цэвэр цагаан
    expect(background).toMatch(/^(rgb\(255, 255, 255\)|oklch\(1 0 0\)|lab\(100 0 0\))$/)
  })
})
