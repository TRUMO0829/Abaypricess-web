import { expect, test } from "@playwright/test"

const reports = [
  { path: "/services/training/report", title: "Сургалтын үр дүнгийн тайлан" },
  { path: "/services/laboratory/report", title: "Business Laboratory тайлан" },
  { path: "/services/update/report", title: "Шинэчлэлийн үр дүнгийн тайлан" },
]

test.describe("үйлчилгээний тайлангийн загвар", () => {
  for (const { path, title } of reports) {
    for (const media of ["screen", "print"] as const) {
      test(`${path} (${media}): агуулга, хөл цаасан дотор багтана`, async ({ page }) => {
        await page.goto(path)
        await page.emulateMedia({ media })
        const paper = page.getByRole("article", { name: title })
        const footer = paper.locator("footer")
        await expect(footer).toBeVisible()
        const p = (await paper.boundingBox())!
        const f = (await footer.boundingBox())!
        expect(f.y).toBeGreaterThanOrEqual(p.y)
        expect(f.y + f.height).toBeLessThanOrEqual(p.y + p.height + 0.5)
        // Хэвтээ чиглэлд ч цааснаас гарахгүй
        expect(f.x).toBeGreaterThanOrEqual(p.x - 0.5)
        expect(f.x + f.width).toBeLessThanOrEqual(p.x + p.width + 0.5)
        // Цаас A4 харьцаанаас намхан биш (md+)
        if (p.width >= 600) expect(p.height).toBeGreaterThanOrEqual((p.width * 297) / 210 - 1)
      })
    }
  }

  test("хэвлэх үед зөвхөн цаас харагдана", async ({ page }) => {
    await page.goto("/services/training/report")
    await page.emulateMedia({ media: "print" })
    await expect(page.getByRole("article", { name: "Сургалтын үр дүнгийн тайлан" })).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Үйлчилгээний цэс" })).toBeHidden()
    await expect(page.getByRole("button", { name: "Хэвлэх / PDF болгох" })).toBeHidden()
    await expect(page.locator("h1")).toBeHidden()
    await expect(page.locator("header").first()).toBeHidden()
  })

  test("dark горимд ч цаас цагаан байна", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("adapt-theme", "dark"))
    await page.goto("/services/training/report")
    await expect(page.locator("html")).toHaveClass(/dark/)
    const paper = page.getByRole("article", { name: "Сургалтын үр дүнгийн тайлан" })
    const background = await paper.evaluate((el) => getComputedStyle(el).backgroundColor)
    // Chrome нь oklch(1 0 0)-г lab(100 0 0) гэж буцаадаг — бүгд цэвэр цагаан
    expect(background).toMatch(/^(rgb\(255, 255, 255\)|oklch\(1 0 0\)|lab\(100 0 0\))$/)
  })
})
