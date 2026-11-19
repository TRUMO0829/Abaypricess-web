import { expect, test, type Page } from "@playwright/test"

// Сервер AUTH_MOCK=1-ээр ажилладаг (playwright.config.ts) — Supabase руу бичихгүй.
// desktop, mobile зэрэг ажиллах тул тест бүр өөр утасны дугаартай.
const randomPhone = () => `9${Math.floor(1_000_000 + Math.random() * 8_999_999)}`
const pretty = (phone: string) => `${phone.slice(0, 4)} ${phone.slice(4)}`

async function register(page: Page, phone: string, next = "/contact") {
  await page.goto(`/register?next=${encodeURIComponent(next)}`)
  await field(page, "name").fill("Тэмүүлэн")
  await field(page, "phone").fill(pretty(phone))
  await field(page, "company").fill("Тест Групп ХХК")
  await field(page, "position").fill("Санхүүгийн менежер")
  await field(page, "password").fill("strongpass1")
  await field(page, "confirmPassword").fill("strongpass1")
  await page.getByRole("button", { name: "Бүртгүүлэх" }).click()
}

/** Next 16 өмнөх хуудсыг нуугдмал байдлаар хадгалдаг тул зөвхөн харагдаж буй талбарыг авна */
const field = (page: Page, id: string) => page.locator(`#${id}:visible`)

const accountButton = (page: Page) => page.getByRole("button", { name: /Миний бүртгэл/ })

test.describe("нэвтрэх, бүртгүүлэх", () => {
  test("бүртгүүлэхэд нэвтэрч, хүсэлтийн маягт 4 мэдээллээр бөглөгдөнө; гарахад хоосорно", async ({ page }) => {
    const phone = randomPhone()
    await register(page, phone)

    await expect(page).toHaveURL(/\/contact$/)
    await expect(page.getByText("Тэмүүлэн нэрээр нэвтэрсэн")).toBeVisible()
    await expect(field(page, "name")).toHaveValue("Тэмүүлэн")
    await expect(field(page, "organization")).toHaveValue("Тест Групп ХХК")
    await expect(field(page, "position")).toHaveValue("Санхүүгийн менежер")
    await expect(field(page, "phone")).toHaveValue(pretty(phone))
    // Имэйл бүртгэлд байхгүй тул хоосон
    await expect(field(page, "email")).toHaveValue("")

    await accountButton(page).click()
    await page.getByRole("menuitem", { name: "Гарах" }).click()
    await expect(page.getByText("Бүртгэлтэй бол нэвтэрч")).toBeVisible()
    await expect(field(page, "name")).toHaveValue("")
    await expect(accountButton(page)).toHaveCount(0)
  })

  test("буруу нууц үгээр нэвтрэхгүй, зөвөөр нэвтэрнэ", async ({ page, browser }) => {
    const phone = randomPhone()
    // Өөр context-д бүртгүүлнэ (энэ хуудас нэвтрээгүй хэвээр)
    const other = await browser.newContext()
    const otherPage = await other.newPage()
    await register(otherPage, phone, "/")
    await expect(otherPage).toHaveURL(/\/$/)
    await other.close()

    await page.goto("/login")
    await field(page, "phone").fill(`+976 ${phone}`)
    await field(page, "password").fill("wrong-password")
    await page.getByRole("button", { name: "Нэвтрэх", exact: true }).click()
    await expect(page.getByText("Утасны дугаар эсвэл нууц үг буруу байна.")).toBeVisible()
    // Утас хадгалагдаж, нууц үг хоосорно
    await expect(field(page, "phone")).toHaveValue(`+976 ${phone}`)

    await field(page, "password").fill("strongpass1")
    await page.getByRole("button", { name: "Нэвтрэх", exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(accountButton(page)).toBeVisible()
  })

  test("бүртгэлийн шалгалт: нууц үг таарахгүй, давхар утас", async ({ page, browser }) => {
    await page.goto("/register")
    await page.getByRole("button", { name: "Бүртгүүлэх" }).click()
    await expect(page.getByText("Нэрээ оруулна уу", { exact: true })).toBeVisible()
    await expect(page.getByText("Компанийн нэрээ оруулна уу")).toBeVisible()
    await expect(page.getByText(/Нууц үг дор хаяж 8/)).toBeVisible()

    const phone = randomPhone()
    const other = await browser.newContext()
    await register(await other.newPage(), phone, "/")
    await other.close()

    await field(page, "name").fill("Бат")
    await field(page, "phone").fill(phone)
    await field(page, "company").fill("Өөр ХХК")
    await field(page, "position").fill("Захирал")
    await field(page, "password").fill("strongpass1")
    await field(page, "confirmPassword").fill("different1")
    await page.getByRole("button", { name: "Бүртгүүлэх" }).click()
    await expect(page.getByText("Нууц үг таарахгүй байна")).toBeVisible()

    await field(page, "password").fill("strongpass1")
    await field(page, "confirmPassword").fill("strongpass1")
    await page.getByRole("button", { name: "Бүртгүүлэх" }).click()
    await expect(page.getByText("Энэ дугаараар бүртгэл үүссэн байна")).toBeVisible()
  })

  test("гаднах хаяг руу redirect хийхгүй", async ({ page }) => {
    await register(page, randomPhone(), "//evil.example.com")
    await expect(page).toHaveURL(/localhost:\d+\/$/)
  })
})
