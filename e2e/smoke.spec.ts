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
  "/services/update/report",
  "/services/laboratory/assessment",
  "/assessment",
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

// 4-р засвар: нүүрээс тоон үзүүлэлт, үйлчилгээний урсгал, үйлчилгээний тойм, FAQ хасагдсан
test("нүүрэнд хасагдсан хэсгүүд гарахгүй", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Тоон үзүүлэлт")).toHaveCount(0)
  await expect(page.locator("#process, #services, #faq")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: /Бидний үйлчилгээний чиглэлүүд|Бидний үндсэн 3 үйлчилгээ/ })).toHaveCount(0)
})

test("нүүр: багийн гишүүд, CV задарна", async ({ page }) => {
  await page.goto("/")
  const team = page.locator("#team")
  const triggers = team.getByRole("button", { name: "CV харах" })
  await expect(triggers).toHaveCount(4)
  const trigger = triggers.first()
  await trigger.click()
  await expect(trigger).toHaveAttribute("aria-expanded", "true")
  await expect(team.getByText("Ажлын туршлага").first()).toBeVisible()
  await expect(team.getByText("Ур чадвар").first()).toBeVisible()
  await expect(team.getByText("Боловсрол")).toHaveCount(0)
  // Ур чадварын доор холбоо барих: утас, имэйл
  const cv = team.getByRole("region").first()
  await expect(cv.getByText("Холбоо барих")).toBeVisible()
  await expect(cv.locator('a[href^="tel:"]')).toBeVisible()
  await expect(cv.locator('a[href^="mailto:"]')).toBeVisible()
  await expect(team.getByText("Төслийн удирдагч").first()).toBeVisible()
})

test("тодорхойгүй үйлчилгээ not-found харуулна", async ({ page }) => {
  await page.goto("/services/does-not-exist")
  // Streaming-ийн улмаас noindex meta 1-ээс олон удаа гарч болно
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0)
})

test("толгой цэсэнд «Үнэлгээний асуулт» байхгүй, үйлчилгээ зөвхөн англи нэртэй", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "desktop цэс")
  await page.goto("/")
  const nav = page.getByRole("navigation", { name: "Үндсэн цэс" })
  await expect(nav.getByRole("link", { name: /Үнэлгээний асуулт|Асуулт хариулт/ })).toHaveCount(0)
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Үнэлгээний асуулт" })).toHaveAttribute("href", "/assessment")
  await page.goto("/services")
  await expect(page.getByRole("heading", { name: "Business Training Service" })).toBeVisible()
  // Footer-ийн компанийн уриа нэр биш тул зөвхөн үндсэн агуулгыг шалгана
  await expect(page.locator("main").getByText(/Бизнесийн сургалт|Бизнес лаборатори|Бизнесийн шинэчлэл/)).toHaveCount(0)
})

test("нүүр: бичлэгийн байр, эрхэм зорилго/алсын хараа үнэт зүйлстэй нэг grid-д", async ({ page }) => {
  await page.goto("/")
  const about = page.locator("#about")
  const cards = about.getByRole("listitem")
  await expect(cards).toHaveCount(6)
  await expect(cards.nth(0)).toContainText("Эрхэм зорилго")
  await expect(cards.nth(1)).toContainText("Алсын хараа")
  // Бичлэгийн холбоос тохируулаагүй үед түр зураг, тохируулсан бол iframe
  await expect(about.locator('iframe[src*="youtube-nocookie.com/embed/"], :text("Танилцуулга бичлэг удахгүй")').first()).toBeVisible()
})
