import { expect, test, type Page } from "@playwright/test"

// Сервер ADMIN_MOCK=1, ADMIN_DEV_PASSWORD=e2e-admin-pass-аар ажилладаг (playwright.config.ts) — Supabase руу бичихгүй.
// Агуулгын засвар бүх тестэд нөлөөлөх тул тусдаа «admin» project-д (бусад тестийн дараа), дараалан ажиллуулж, төгсгөлд нь буцаана.
test.describe.configure({ mode: "serial" })

const PASSWORD = "e2e-admin-pass"

async function login(page: Page, password = PASSWORD) {
  await page.goto("/admin/login")
  await page.getByLabel("Нэвтрэх нэр").fill("admin")
  await page.getByLabel("Нууц үг").fill(password)
  await page.getByRole("button", { name: "Нэвтрэх" }).click()
  if (password === PASSWORD) await expect(page).toHaveURL(/\/admin$/)
}

test.describe("админ", () => {
  test("нэвтрээгүй бол нэвтрэх хуудас руу, буруу нууц үгэнд алдаа", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/admin\/login$/)
    // Сайтын толгой цэс харагдахгүй
    await expect(page.getByRole("navigation", { name: "Үндсэн цэс" })).toHaveCount(0)

    await login(page, "wrong-password")
    await expect(page.getByText("Нэвтрэх нэр эсвэл нууц үг буруу байна.")).toBeVisible()
  })

  test("текст засахад вебсайт дээр шинэчлэгдэж, анхны текст рүү буцна", async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/admin$/)
    await page.getByRole("link", { name: /Цэс, footer/ }).click()

    const title = page.locator("#f-notFoundContent-title")
    await expect(title).toHaveValue("Хуудас олдсонгүй")
    await title.fill("Админаас зассан 404 гарчиг")
    await page.getByRole("button", { name: "Хадгалах" }).click()
    await expect(page.getByRole("status")).toContainText("Хадгалагдлаа")

    await page.goto("/no-such-page")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Админаас зассан 404 гарчиг")

    await page.goto("/admin/content/navigation")
    await expect(page.locator("#f-notFoundContent-title")).toHaveValue("Админаас зассан 404 гарчиг")
    await page.getByRole("button", { name: "Анхны текст рүү буцаах" }).click()
    await page.getByRole("button", { name: "Тийм, буцаах" }).click()
    await expect(page.getByRole("status")).toContainText("Анхны текст")

    await page.goto("/no-such-page")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Хуудас олдсонгүй")
  })

  test("багийн гишүүн нэмэхэд нүүр хуудсанд харагдана", async ({ page }) => {
    await login(page)
    await page.goto("/admin/content/team")
    await page.getByRole("button", { name: "Шинээр нэмэх" }).click()
    const member = page.locator("details").last()
    await member.locator('input[id$="-name"]').fill("Шинэ Зөвлөх")
    await member.locator('input[id$="-role"]').fill("Ахлах зөвлөх")
    await page.getByRole("button", { name: "Хадгалах" }).click()
    await expect(page.getByRole("status")).toContainText("Хадгалагдлаа")

    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Шинэ Зөвлөх" })).toBeVisible()

    await page.goto("/admin/content/team")
    await page.getByRole("button", { name: "Анхны текст рүү буцаах" }).click()
    await page.getByRole("button", { name: "Тийм, буцаах" }).click()
    await expect(page.getByRole("status")).toContainText("Анхны текст")
  })

  test("шинэ сургагч багшид туршлага, ур чадвар, зураг нэмэхэд сайт дээр харагдана", async ({ page }) => {
    await login(page)
    await page.goto("/admin/content/services")
    await page.locator("summary", { hasText: "Business Training Service" }).first().click()
    const trainers = page.locator("fieldset", { has: page.locator("legend", { hasText: "Сургагч багш нар" }) }).first()
    await trainers.getByRole("button", { name: "Шинээр нэмэх" }).last().click()
    const trainer = trainers.locator("details").last()
    await trainer.locator('input[id$="-name"]').fill("Туршилтын Багш")
    await trainer.locator('input[id$="-role"]').fill("Сургагч")
    for (const [legend, text] of [
      ["Ажлын туршлага", "Ахлах сургагч — 2020 оноос"],
      ["Ур чадвар", "Төсөл удирдлага"],
    ]) {
      const list = trainer.locator("fieldset", { has: page.locator("legend", { hasText: legend }) })
      await list.getByRole("button", { name: "Мөр нэмэх" }).click()
      await list.locator("input").first().fill(text)
    }
    await trainer.locator('input[type="file"]').setInputFiles("e2e/fixtures/photo.png")
    await expect(trainer.locator('input[id$="-photo"]')).toHaveValue(/^\/media\//)
    await page.getByRole("button", { name: "Хадгалах" }).click()
    await expect(page.getByRole("status")).toContainText("Хадгалагдлаа")

    await page.goto("/services/training/trainers")
    const card = page.getByRole("listitem").filter({ hasText: "Туршилтын Багш" })
    await expect(card.getByRole("img", { name: "Туршилтын Багш" })).toHaveAttribute("src", /^\/media\//)
    await card.getByText("CV харах").click()
    await expect(card.getByText("Ахлах сургагч — 2020 оноос")).toBeVisible()
    await expect(card.getByText("Төсөл удирдлага")).toBeVisible()

    await page.goto("/admin/content/services")
    await page.getByRole("button", { name: "Анхны текст рүү буцаах" }).click()
    await page.getByRole("button", { name: "Тийм, буцаах" }).click()
    await expect(page.getByRole("status")).toContainText("Анхны текст")
  })

  test("тайлан, хөтөлбөр, гэрээний PDF материал оруулахад үйлчилгээний хуудсанд харагдана", async ({ page }) => {
    await login(page)
    await page.goto("/admin/content/services")
    await page.locator("summary", { hasText: "Business Training Service" }).first().click()
    const lists = [
      { legend: "Гэрээний материал", title: "Гэрээний загвар", path: "/services/training" },
      { legend: "Хөтөлбөрийн материал", title: "Хөтөлбөрийн дэлгэрэнгүй", path: "/services/training/programs" },
      { legend: "Тайлангийн материал", title: "Тайлангийн жишээ", path: "/services/training/report" },
    ]
    for (const { legend, title } of lists) {
      const list = page.locator("fieldset", { has: page.locator("legend", { hasText: legend }) }).first()
      await list.getByRole("button", { name: "Шинээр нэмэх" }).click()
      const doc = list.locator("details").last()
      await doc.locator('input[id$="-title"]').fill(title)
      await doc.locator('input[type="file"]').setInputFiles("e2e/fixtures/contract.pdf")
      await expect(doc.locator('input[id$="-file"]')).toHaveValue(/^\/media\//)
    }
    // Зураг PDF талбарт орохгүй
    const report = page.locator("fieldset", { has: page.locator("legend", { hasText: "Тайлангийн материал" }) }).first()
    await report.locator('input[type="file"]').last().setInputFiles("e2e/fixtures/photo.png")
    await expect(report.getByText("Зөвхөн PDF файл оруулна.")).toBeVisible()

    await page.getByRole("button", { name: "Хадгалах" }).click()
    await expect(page.getByRole("status")).toContainText("Хадгалагдлаа")

    for (const { title, path } of lists) {
      await page.goto(path)
      const link = page.getByRole("link", { name: new RegExp(title) })
      await expect(link).toHaveAttribute("href", /^\/media\//)
      const response = await page.request.get((await link.getAttribute("href"))!)
      expect(response.headers()["content-type"]).toBe("application/pdf")
    }

    await page.goto("/admin/content/services")
    await page.getByRole("button", { name: "Анхны текст рүү буцаах" }).click()
    await page.getByRole("button", { name: "Тийм, буцаах" }).click()
    await expect(page.getByRole("status")).toContainText("Анхны текст")
  })

  test("харилцагчдын жагсаалтад бүртгүүлсэн хэрэглэгч харагдана", async ({ page, browser }) => {
    const phone = `8${Math.floor(1_000_000 + Math.random() * 8_999_999)}`
    const visitor = await browser.newPage()
    await visitor.goto("/register")
    await visitor.locator("#name:visible").fill("Админ Тест")
    await visitor.locator("#phone:visible").fill(phone)
    await visitor.locator("#company:visible").fill("Харилцагч ХХК")
    await visitor.locator("#position:visible").fill("Менежер")
    await visitor.locator("#password:visible").fill("pass1234")
    await visitor.locator("#confirmPassword:visible").fill("pass1234")
    await visitor.getByRole("button", { name: "Бүртгүүлэх" }).click()
    await expect(visitor).toHaveURL(/\/$/)
    await visitor.close()

    await login(page)
    await page.getByRole("link", { name: "Харилцагчид" }).first().click()
    await expect(page.getByRole("heading", { name: "Харилцагчид" })).toBeVisible()
    await page.getByLabel("Харилцагч хайх").fill("Харилцагч ХХК")
    await expect(page.getByRole("cell", { name: "Админ Тест" })).toBeVisible()

    await page.getByRole("button", { name: "Гарах" }).click()
    await expect(page).toHaveURL(/\/admin\/login$/)
    await page.goto("/admin/users")
    await expect(page).toHaveURL(/\/admin\/login$/)
  })
})
