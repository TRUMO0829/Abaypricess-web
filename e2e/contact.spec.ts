import { expect, test, type Browser, type Page } from "@playwright/test"

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
  test.describe("уулзалтын цаг (туршилтын календарь)", () => {
    async function fillRequired(page: Page) {
      await page.locator("#name").fill("Тест Хэрэглэгч")
      await page.locator("#organization").fill("Тест ХХК")
      await page.locator("#email").fill("test@example.mn")
      await page.locator("#phone").fill("9911 2233")
    }

    const mailtoCalls = (page: Page) =>
      page.evaluate(() => (window as unknown as { __mailtoCalls: string[] }).__mailtoCalls)

    test("сул цаг сонгож илгээхэд уулзалт бүртгэгдэж, тэр цаг алга болно", async ({ page }, testInfo) => {
      await page.goto("/contact?service=training")
      const picker = page.getByRole("group", { name: "Уулзалтын цаг" })
      await picker.getByRole("radio", { name: "30 минут" }).check()
      const slots = picker.getByRole("radiogroup", { name: /^Сул цаг/ }).getByRole("radio")
      await expect(slots.first()).toBeAttached()
      // desktop, mobile project зэрэг ажиллахад нэг цагийг булаалдахгүй
      const slot = testInfo.project.name === "mobile" ? slots.last() : slots.first()
      const start = (await slot.getAttribute("value"))!
      await slot.check()
      await expect(picker.getByText("Сонгосон цаг")).toBeVisible()

      await fillRequired(page)
      await page.getByRole("button", { name: "Цаг захиалж, хүсэлт илгээх" }).click()

      await expect(page.getByRole("status")).toContainText("Уулзалтын цаг баталгаажлаа")
      expect(await mailtoCalls(page)).toHaveLength(0)

      const res = await page.request.get("/api/booking/availability?duration=30")
      const body = (await res.json()) as { days: { slots: string[] }[] }
      expect(body.days.flatMap((day) => day.slots)).not.toContain(start)
    })

    /** Өөр browser context-оос (өөр хэрэглэгч) тухайн өдрийн ижил байрлалын цагийг захиална. */
    async function bookFromAnotherUser(browser: Browser, dayIndex: number, pickLast: boolean) {
      const context = await browser.newContext()
      const other = await context.newPage()
      await other.goto("/contact?service=laboratory")
      const picker = other.getByRole("group", { name: "Уулзалтын цаг" })
      await picker.getByRole("radiogroup", { name: "Өдөр" }).getByRole("radio").nth(dayIndex).check()
      const slots = picker.getByRole("radiogroup", { name: /^Сул цаг/ }).getByRole("radio")
      await (pickLast ? slots.last() : slots.first()).check()
      await fillRequired(other)
      await other.getByRole("button", { name: "Цаг захиалж, хүсэлт илгээх" }).click()
      await expect(other.getByRole("status")).toContainText("Уулзалтын цаг баталгаажлаа")
      await context.close()
    }

    async function selectSlot(page: Page, dayIndex: number, pickLast: boolean) {
      const picker = page.getByRole("group", { name: "Уулзалтын цаг" })
      await picker.getByRole("radiogroup", { name: "Өдөр" }).getByRole("radio").nth(dayIndex).check()
      const slots = picker.getByRole("radiogroup", { name: /^Сул цаг/ }).getByRole("radio")
      await (pickLast ? slots.last() : slots.first()).check()
      await expect(picker.getByText("Сонгосон цаг")).toBeVisible()
    }

    test("хуучирсан цагаар илгээвэл сервер давхар захиалгыг зөвшөөрөхгүй", async ({ page, browser }, testInfo) => {
      // Хуудас шинэчлэгдээгүй байх нөхцөл: эхний хариуг л үргэлж буцаана
      let stale: string | undefined
      await page.route("**/api/booking/availability**", async (route) => {
        if (stale) return route.fulfill({ body: stale, contentType: "application/json" })
        const response = await route.fetch()
        stale = await response.text()
        await route.fulfill({ response, body: stale })
      })
      await page.goto("/contact?service=laboratory")
      const lastDay = (await page.getByRole("radiogroup", { name: "Өдөр" }).getByRole("radio").count()) - 1
      const pickLast = testInfo.project.name === "mobile"
      await selectSlot(page, lastDay, pickLast)
      await fillRequired(page)

      await bookFromAnotherUser(browser, lastDay, pickLast)

      await page.getByRole("button", { name: "Цаг захиалж, хүсэлт илгээх" }).click()
      await expect(page.getByText("Сонгосон цаг дөнгөж сая захиалагдсан байна")).toBeVisible()
      await expect(page.getByRole("button", { name: "Хүсэлт илгээх", exact: true })).toBeVisible()
      expect(await mailtoCalls(page)).toHaveLength(0)
    })

    test("сул цаг шинэчлэгдэхэд дүүрсэн цагийн сонголт цуцлагдана", async ({ page, browser }, testInfo) => {
      await page.goto("/contact?service=laboratory")
      const dayIndex = (await page.getByRole("radiogroup", { name: "Өдөр" }).getByRole("radio").count()) - 2
      const pickLast = testInfo.project.name === "mobile"
      await selectSlot(page, dayIndex, pickLast)

      await bookFromAnotherUser(browser, dayIndex, pickLast)

      // Табыг дахин нээх үеийн шинэчлэлтийг дуурайна
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")))
      await expect(page.getByText("Сонгосон цаг өөр хүнд захиалагдсан тул дахин сонгоно уу.")).toBeVisible()
      await expect(page.getByRole("button", { name: "Хүсэлт илгээх", exact: true })).toBeVisible()
    })

    test("availability API буруу хугацааг хүлээж авахгүй", async ({ request }) => {
      expect((await request.get("/api/booking/availability?duration=45")).status()).toBe(400)
      const ok = await request.get("/api/booking/availability?duration=60")
      expect(ok.status()).toBe(200)
      expect(((await ok.json()) as { mode: string }).mode).toBe("mock")
    })
  })
})
