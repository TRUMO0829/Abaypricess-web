/*
 * Админы засварын дүрэм — server (sanitize, merge) болон client (засварын маягт) хоёуланд ижил.
 * Зам (path) нь `["services", 0, "packages", 1, "name"]` хэлбэртэй; эхний элемент нь `defaultContent`-ийн түлхүүр.
 */

export type Path = (string | number)[]
export type Plain = string | number | boolean | null | Plain[] | { [key: string]: Plain }

/** Бүтэц, логиктой холбоотой тул засагдахгүй (харагдахгүй) түлхүүрүүд. `price` тусдаа (тоо эсвэл хоосон). */
export const LOCKED_KEYS = new Set([
  "id",
  "slug",
  "href",
  "order",
  "icon",
  "segment",
  "type",
  "version",
  "weight",
  "points",
  "min",
  "max",
  "reverse",
  "required",
  "service",
  "score",
  "fileName",
])

/** Мөр нэмж, хасаж болох объектын жагсаалтууд (`*` = дурын индекс). Текстийн жагсаалт үндсэндээ нэмэгдэх боломжтой. */
const GROWABLE = new Set([
  "team",
  "services.*.trainers",
  "services.*.programs",
  "services.*.packages",
  "services.*.process",
  "privacyPolicy.sections",
  "contactInfoContent.steps",
  "reportTemplates.*.sections",
  "services.*.contractFiles",
  "services.*.programFiles",
  "services.*.reportFiles",
])

/** Анхны утга нь хоосон объектын жагсаалтын шинэ мөрийн загвар */
const documentShape = { id: "", title: "", file: "" }
const EMPTY_LIST_SHAPES: Record<string, Record<string, string>> = {
  "services.*.contractFiles": documentShape,
  "services.*.programFiles": documentShape,
  "services.*.reportFiles": documentShape,
}

/** Тоо нь тогтмол байх ёстой текстийн жагсаалт */
const FIXED_STRING_ARRAYS = new Set(["bookingContent.weekdays", "bookingContent.weekdaysShort"])

/** Бусад утгаас автоматаар бүрддэг тул засварт харагдахгүй */
const HIDDEN = new Set([
  "footerNav.services",
  "bookingContent.weekdays",
  "bookingContent.weekdaysShort",
  // Сервер дээр эдгээр утгаар шалгадаг
  "assessmentPage.respondent.employeeOptions",
])

export const MAX_TEXT = 5000
export const MAX_ITEMS = 100

export const pattern = (path: Path) => path.map((part) => (typeof part === "number" ? "*" : part)).join(".")

export const isHidden = (path: Path) => HIDDEN.has(pattern(path))

export const isLocked = (key: string | number | undefined) => typeof key === "string" && LOCKED_KEYS.has(key)

/** React component (lucide icon) эсвэл функц — JSON-д орохгүй, кодоос ирнэ */
export function isCode(value: unknown): boolean {
  return typeof value === "function" || (typeof value === "object" && value !== null && "$$typeof" in value)
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !isCode(value)
}

export function isGrowable(path: Path, sample: unknown[]): boolean {
  const key = pattern(path)
  if (GROWABLE.has(key)) return true
  // Хоосон жагсаалт (ж: шинэ гишүүний туршлага) нь текстийн жагсаалт — мөр нэмэх боломжтой байх ёстой
  return sample.every((item) => typeof item === "string") && !FIXED_STRING_ARRAYS.has(key)
}

const isPerson = (shape: Record<string, unknown>) => "expertise" in shape && "role" in shape

function blank(value: unknown, key?: string): unknown {
  if (isCode(value)) return value
  if (key === "price") return null
  if (typeof value === "string") return ""
  if (typeof value === "boolean") return false
  if (Array.isArray(value)) return []
  if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v, k)]))
  return value
}

/**
 * Шинэ мөрийн хоосон загвар: жагсаалтын бүх мөрийн түлхүүрийн нэгдэл (ж: зарим багцад л `popular` байдаг).
 * Текстийн жагсаалт бол "".
 */
export function itemShape(items: unknown[], path?: Path): unknown {
  const emptyShape = path && items.length === 0 ? EMPTY_LIST_SHAPES[pattern(path)] : undefined
  if (emptyShape) return { ...emptyShape }
  if (items.every((item) => typeof item === "string")) return ""
  const shape: Record<string, unknown> = {}
  for (const item of items) {
    if (!isPlainObject(item)) continue
    for (const [key, value] of Object.entries(item)) {
      if (!(key in shape) && value !== undefined) shape[key] = blank(value, key)
    }
  }
  // Хүний карт: зураг, утас, имэйлийг default-д байхгүй ч засах боломжтой
  if (isPerson(shape)) {
    for (const key of ["photo", "phone", "email"]) shape[key] ??= ""
  }
  return shape
}

export const isValidId = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,60}$/.test(value)

export function newId(): string {
  return `custom-${Math.random().toString(36).slice(2, 10)}`
}

/** Админ засварт default-оос тохирох мөр: id-аар, id-гүй бол индексээр */
export function matchItem(defaults: unknown[], item: Record<string, unknown>, index: number): Record<string, unknown> | undefined {
  if (typeof item.id === "string") {
    const found = defaults.find((d) => isPlainObject(d) && d.id === item.id)
    return isPlainObject(found) ? found : undefined
  }
  const byIndex = defaults[index]
  return isPlainObject(byIndex) ? byIndex : undefined
}

/** JSON болгох (icon, функцыг хасна) — client руу дамжуулах, хадгалахад */
export function toPlain<T>(value: T): Plain {
  return JSON.parse(JSON.stringify(value, (_key, v: unknown) => (isCode(v) ? undefined : v))) as Plain
}

export function getAt(root: unknown, path: Path): unknown {
  let current = root
  for (const part of path) {
    if (current === null || typeof current !== "object") return undefined
    current = (current as Record<string | number, unknown>)[part]
  }
  return current
}
