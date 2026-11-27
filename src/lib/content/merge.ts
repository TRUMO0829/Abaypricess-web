import {
  isCode,
  isGrowable,
  isHidden,
  isLocked,
  isPlainObject,
  isValidId,
  itemShape,
  matchItem,
  MAX_ITEMS,
  MAX_TEXT,
  newId,
  type Path,
} from "@/lib/content/rules"

const lastKey = (path: Path) => path[path.length - 1]

/* ── Хадгалахын өмнө: зөвхөн default-д байгаа, засаж болох талбарыг, зөв төрлөөр нь үлдээнэ ─────────────── */

export function sanitize(def: unknown, input: unknown, path: Path): unknown {
  const key = lastKey(path)
  if (isCode(def) || isHidden(path)) return undefined
  if (key === "price") {
    if (input === null) return null
    return typeof input === "number" && Number.isFinite(input) && input >= 0 ? Math.round(input) : undefined
  }
  if (isLocked(key)) return undefined
  if (typeof def === "string") return typeof input === "string" ? input.slice(0, MAX_TEXT) : undefined
  if (typeof def === "boolean") return typeof input === "boolean" ? input : undefined
  if (Array.isArray(def)) {
    if (!Array.isArray(input)) return undefined
    if (!isGrowable(path, def)) {
      // Тогтмол урттай: индексээр, дутуу/алдаатай нь null → default хэвээр
      return def.map((item, index) => sanitize(item, input[index], [...path, index]) ?? null)
    }
    const shape = itemShape(def, path)
    return input.slice(0, MAX_ITEMS).flatMap((item: unknown, index): unknown[] => {
      if (typeof shape === "string") return typeof item === "string" ? [item.slice(0, MAX_TEXT)] : []
      if (!isPlainObject(item) || !isPlainObject(shape)) return []
      const base = matchItem(def, item, index)
      const clean = sanitizeObject({ ...shape, ...base }, item, [...path, index]) ?? {}
      if ("id" in shape) clean.id = isValidId(item.id) ? item.id : newId()
      return [clean]
    })
  }
  if (isPlainObject(def)) return sanitizeObject(def, input, path)
  return undefined
}

function sanitizeObject(def: Record<string, unknown>, input: unknown, path: Path): Record<string, unknown> | undefined {
  if (!isPlainObject(input)) return undefined
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(def)) {
    if (!(key in input)) continue
    const clean = sanitize(value, input[key], [...path, key])
    if (clean !== undefined) out[key] = clean
  }
  return out
}

/* ── Уншихад: админы засварыг default дээр давхарлана. Хуучирсан/буруу төрлийн утгыг үл тооно ─────────── */

export function merge<T>(def: T, override: unknown, path: Path): T {
  return mergeValue(def, override, path) as T
}

function mergeValue(def: unknown, ov: unknown, path: Path): unknown {
  const key = lastKey(path)
  if (ov === undefined || isCode(def) || isHidden(path)) return def
  if (key === "price") return ov === null || (typeof ov === "number" && Number.isFinite(ov)) ? ov : def
  if (isLocked(key) || ov === null) return def
  if (typeof def === "string") return typeof ov === "string" ? ov : def
  if (typeof def === "boolean") return typeof ov === "boolean" ? ov : def
  if (def === undefined) return typeof ov === "string" || typeof ov === "boolean" ? ov : def
  if (Array.isArray(def)) {
    if (!Array.isArray(ov)) return def
    if (!isGrowable(path, def)) return def.map((item, index) => mergeValue(item, ov[index], [...path, index]))
    const shape = itemShape(def, path)
    return ov.flatMap((item: unknown, index): unknown[] => {
      if (typeof shape === "string") return typeof item === "string" ? [item] : []
      if (!isPlainObject(item) || !isPlainObject(shape)) return []
      // Шинэ мөр: icon гэх мэт кодын утгыг эхний мөрөөс авна
      const base =
        matchItem(def, item, index) ??
        Object.fromEntries(Object.entries(isPlainObject(def[0]) ? def[0] : {}).filter(([, value]) => isCode(value)))
      const merged = mergeObject(base, item, [...path, index], shape)
      if (isValidId(item.id)) merged.id = item.id
      return [merged]
    })
  }
  if (isPlainObject(def)) return mergeObject(def, ov, path)
  return def
}

function mergeObject(
  def: Record<string, unknown>,
  ov: unknown,
  path: Path,
  shape?: Record<string, unknown>
): Record<string, unknown> {
  if (!isPlainObject(ov)) return def
  const out: Record<string, unknown> = { ...def }
  for (const [key, value] of Object.entries(ov)) {
    const base = key in def ? def[key] : shape?.[key]
    if (base === undefined && !(shape && key in shape)) continue
    out[key] = mergeValue(key in def ? def[key] : base, value, [...path, key])
  }
  return out
}
