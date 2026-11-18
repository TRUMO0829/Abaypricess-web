import { expect, test, type Page } from "@playwright/test"

import { assessment } from "../src/content/assessment"

// Сервер ASSESSMENT_MOCK=1-ээр ажилладаг (playwright.config.ts) — Supabase руу бичихгүй

async function fillRespondent(page: Page) {
  await page.locator("#organization").fill("Тест ХХК")
  await page.locator("#name").fill("Бат")
  await page.locator("#position").fill("Гүйцэтгэх захирал")
  await page.locator("#email").fill("bat@test.mn")
  await page.locator("#phone").fill("9911 2233")
  await page.locator("label", { hasText: "11–50" }).click()
}

/** Тухайн бүлгийн radio асуулт бүрт эхний сонголтыг сонгоно (текст асуулт заавал биш). */
async function answerVisibleSection(page: Page) {
  const fieldsets = page.locator('fieldset[id^="q-"]')
  const count = await fieldsets.count()
  for (let i = 0; i < count; i++) {
    const fieldset = fieldsets.nth(i)
    if (!(await fieldset.locator('input[type="radio"]').count())) continue
    // Чип (label) дээр дарна — хэрэглэгчийн адил; smooth scroll дуустал Playwright хүлээнэ
    await fieldset.locator("label").first().click()
    await expect(fieldset.locator('input[type="radio"]').first()).toBeChecked()
  }
}

test.describe("/assessment байгууллагын үнэлгээ", () => {
  test("заавал талбарыг шалгаж, бүх бүлгийг бөглөөд илгээнэ", async ({ page }) => {
    await page.goto("/assessment")
    await page.getByRole("button", { name: "Үнэлгээг эхлэх" }).click()

    // Байгууллагын мэдээлэлгүйгээр цааш явахгүй
    await page.getByRole("button", { name: "Дараах" }).click()
    await expect(page.getByText("Байгууллагын нэрээ оруулна уу")).toBeVisible()
    await expect(page.getByText("Ажилтны тоогоо сонгоно уу")).toBeVisible()
    await expect(page.getByText("Нэрээ оруулна уу", { exact: true })).toBeVisible()
    await expect(page.getByText("Албан тушаалаа оруулна уу")).toBeVisible()

    await fillRespondent(page)
    await page.getByRole("button", { name: "Дараах" }).click()

    const first = assessment.sections[0]
    await expect(page.getByRole("heading", { level: 2, name: first.title })).toBeVisible()

    // Хариулаагүй заавал асуулттай бүлгээс цааш явахгүй
    await page.getByRole("button", { name: "Дараах" }).click()
    await expect(page.getByText(/заавал асуултад хариулаагүй байна/)).toBeVisible()
    await expect(page.locator("fieldset[data-invalid]").first()).toBeVisible()

    for (const section of assessment.sections) {
      await expect(page.getByRole("heading", { level: 2, name: section.title })).toBeVisible()
      await answerVisibleSection(page)
      await page.getByRole("button", { name: "Дараах" }).click()
    }

    await expect(page.getByRole("heading", { level: 2, name: "Илгээхэд бэлэн" })).toBeVisible()
    await page.getByRole("button", { name: "Үнэлгээ илгээх" }).click()
    await expect(page.getByRole("heading", { name: "Үнэлгээ амжилттай илгээгдлээ" })).toBeVisible()

    // Илгээсний дараа ноорог устсан тул дахин ороход «Үргэлжлүүлэх» гарахгүй
    await page.reload()
    await expect(page.getByRole("button", { name: "Үнэлгээг эхлэх" })).toBeVisible()
  })

  test("хариулт хөтөч дээр хадгалагдаж, дараа нь үргэлжлүүлнэ", async ({ page }) => {
    await page.goto("/assessment")
    await page.getByRole("button", { name: "Үнэлгээг эхлэх" }).click()
    await fillRespondent(page)
    await page.getByRole("button", { name: "Дараах" }).click()
    await answerVisibleSection(page)

    await page.reload()
    await page.getByRole("button", { name: "Үргэлжлүүлэх" }).click()
    await expect(page.getByRole("heading", { level: 2, name: assessment.sections[0].title })).toBeVisible()
    const firstQuestion = page.locator('fieldset[id^="q-"]').first()
    await expect(firstQuestion.locator('input[type="radio"]').first()).toBeChecked()
  })
})
