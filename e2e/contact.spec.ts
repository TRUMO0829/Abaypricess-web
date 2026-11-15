import { expect, test, type Page } from "@playwright/test"

const serviceTrigger = (page: Page) => page.locator("#service")
const packageTrigger = (page: Page) => page.locator("#packageId")

async function choose(page: Page, trigger: string, option: string) {
  await page.locator(trigger).click()
  await page.getByRole("option", { name: option }).click()
}

/**
 * mailto шилжилтийг stub хийнэ — тест хэзээ ч хэрэглэгчийн имэйл программыг бодитоор нээх ёсгүй.
 * `openMailClient()` нь `<a>.click()` ашигладаг тул mailto click-ийг бүртгээд navigation-ийг зогсооно.
 */
async function stubMailto(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __mailtoCalls: string[]; __mailtoStubbed: boolean }
    w.__mailtoCalls = []
    const original = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      if (this.href.startsWith("mailto:")) {
        w.__mailtoCalls.push(this.href)
        return
      }
      return original.call(this)
    }
    // Хэрэглэгч "дахин нээх" холбоос дээр дарах зэрэг бодит mailto navigation-ийг ч хаана
    document.addEventListener(
      "click",
      (event) => {
        const anchor = (event.target as Element | null)?.closest?.("a[href^='mailto:']")
        if (anchor) event.preventDefault()
      },
      true
    )
    w.__mailtoStubbed = true
  })
}

test.describe("/contact хүсэлтийн маягт", () => {
  // Бүх тестэд stub идэвхтэй — маягт илгээх бүрд mailto нээгдэх эрсдэлгүй
  test.beforeEach(async ({ page }) => {
    await stubMailto(page)
  })

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
    // Stub идэвхгүй бол submit хийхгүй (бодит Mail нээгдэхээс сэргийлнэ)
    expect(await page.evaluate(() => (window as unknown as { __mailtoStubbed?: boolean }).__mailtoStubbed)).toBe(true)
    await page.getByRole("button", { name: "Хүсэлт илгээх" }).click()

    await expect(page.getByText("Имэйл программ тань нээгдэж байна")).toBeVisible()
    const calls = await page.evaluate(() => (window as unknown as { __mailtoCalls: string[] }).__mailtoCalls)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatch(/^mailto:/)
    await expect(page.getByText(/амжилттай/i)).toHaveCount(0)

    const href = await page.getByRole("link", { name: "Имэйлийг дахин нээх" }).getAttribute("href")
    expect(href).toMatch(/^mailto:/)
    const body = decodeURIComponent(new URL(href!).searchParams.get("body") ?? "")
    expect(body).toContain("Багц: Стандарт")
    expect(body).not.toContain("standard")
  })
})
