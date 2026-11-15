import { expect, test, type Page } from "@playwright/test"

const serviceTrigger = (page: Page) => page.locator("#service")
const packageTrigger = (page: Page) => page.locator("#packageId")

async function choose(page: Page, trigger: string, option: string) {
  await page.locator(trigger).click()
  await page.getByRole("option", { name: option }).click()
}

test.describe("/contact хүсэлтийн маягт", () => {
  test("?service=&package= утгаар урьдчилж бөглөнө", async ({ page }) => {
    await page.goto("/contact?service=laboratory&package=full")
    await expect(serviceTrigger(page)).toContainText("Бизнес лаборатори")
    await expect(packageTrigger(page)).toContainText("Цогц оношилгоо")
  })

  test("буруу утгыг үл тооно", async ({ page }) => {
    await page.goto("/contact?service=unknown&package=full")
    await expect(serviceTrigger(page)).toContainText("Үйлчилгээ сонгох")
    await expect(packageTrigger(page)).toBeDisabled()

    // Багц нь өөр үйлчилгээнийх бол үл тооно
    await page.goto("/contact?service=training&package=full")
    await expect(serviceTrigger(page)).toContainText("Бизнесийн сургалт")
    await expect(packageTrigger(page)).toContainText("Багц сонгох")
  })

  test("үйлчилгээ солиход багцын сонголт шинэчлэгдэнэ", async ({ page }) => {
    await page.goto("/contact?service=training&package=standard")
    await expect(packageTrigger(page)).toContainText("Стандарт")
    await choose(page, "#service", "Бизнесийн шинэчлэл (Business Update)")
    await expect(packageTrigger(page)).toContainText("Багц сонгох")
    await packageTrigger(page).click()
    await expect(page.getByRole("option", { name: "Цогц шинэчлэл" })).toBeVisible()
    await expect(page.getByRole("option", { name: "Стандарт" })).toHaveCount(0)
  })

  test("хоосон илгээвэл монгол алдаа, aria-invalid харуулна", async ({ page }) => {
    await page.goto("/contact")
    await page.getByRole("button", { name: "Хүсэлт илгээх" }).click()

    await expect(page.getByText("Овог нэрээ оруулна уу")).toBeVisible()
    await expect(page.getByText("Имэйл хаягаа оруулна уу")).toBeVisible()
    await expect(page.getByText("Утасны дугаараа оруулна уу")).toBeVisible()
    await expect(page.getByText("Үйлчилгээгээ сонгоно уу", { exact: true })).toBeVisible()
    await expect(page.locator("#name")).toHaveAttribute("aria-invalid", "true")
    await expect(page.getByText(/Маягтад \d+ алдаа байна/)).toBeVisible()
    await expect(page.locator("#name")).toBeFocused()
  })

  test("утас, имэйлийн форматыг шалгана", async ({ page }) => {
    await page.goto("/contact")
    await page.locator("#email").fill("буруу-имэйл")
    await page.locator("#phone").fill("12345")
    await page.getByRole("button", { name: "Хүсэлт илгээх" }).click()
    await expect(page.getByText(/Имэйл хаяг буруу байна/)).toBeVisible()
    await expect(page.getByText(/Утасны дугаар 8 оронтой байна/)).toBeVisible()

    await page.locator("#phone").fill("+976 9911-2233")
    await expect(page.getByText(/Утасны дугаар 8 оронтой байна/)).toHaveCount(0)
  })

  test("илгээхэд худал амжилт биш, mailto мэдэгдэл харуулна", async ({ page }) => {
    await page.goto("/contact?service=training&package=standard")
    await page.locator("#name").fill("Тест Хэрэглэгч")
    await page.locator("#organization").fill("Тест ХХК")
    await page.locator("#email").fill("test@example.mn")
    await page.locator("#phone").fill("9911 2233")
    await page.getByRole("button", { name: "Хүсэлт илгээх" }).click()

    await expect(page.getByText("Имэйл программ тань нээгдэж байна")).toBeVisible()
    await expect(page.getByText(/амжилттай/i)).toHaveCount(0)

    const href = await page.getByRole("link", { name: "Имэйлийг дахин нээх" }).getAttribute("href")
    expect(href).toMatch(/^mailto:/)
    const body = decodeURIComponent(new URL(href!).searchParams.get("body") ?? "")
    expect(body).toContain("Багц: Стандарт")
    expect(body).not.toContain("standard")
  })
})
