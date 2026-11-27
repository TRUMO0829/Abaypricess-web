"use client"

import { useEffect, useState, useTransition } from "react"
import { ArrowDown, ArrowUp, Check, ChevronRight, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react"

import { PhotoInput } from "@/components/admin/photo-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { resetContentAction, saveContentAction } from "@/lib/admin/actions"
import { itemTitle, keyLabel } from "@/lib/content/labels"
import {
  getAt,
  isGrowable,
  isHidden,
  isLocked,
  isPlainObject,
  itemShape,
  newId,
  type Path,
  type Plain,
} from "@/lib/content/rules"
import { cn } from "@/lib/utils"

export interface EditorField {
  key: string
  title: string
  value: Plain
  defaults: Plain
}

type Values = Record<string, Plain>

/** "2026-11-27 14:05" (Улаанбаатарын цагаар, server/client-д ижил) */
const formatTime = (iso: string) => new Date(Date.parse(iso) + 8 * 3600_000).toISOString().slice(0, 16).replace("T", " ")

function setAt(root: Plain, path: Path, value: Plain): Plain {
  if (path.length === 0) return value
  const [head, ...rest] = path
  if (Array.isArray(root)) {
    const copy = [...root]
    copy[head as number] = setAt(copy[head as number], rest, value)
    return copy
  }
  const record = (isPlainObject(root) ? root : {}) as Record<string, Plain>
  return { ...record, [head]: setAt(record[head as string] ?? null, rest, value) }
}

/** Текстийн урт, мөр шилжүүлэгтэй эсэхээс хамаарч input эсвэл textarea */
function TextInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const long = value.length > 70 || value.includes("\n")
  return long ? (
    <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={Math.min(8, Math.ceil(value.length / 90) + 1)} />
  ) : (
    <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
  )
}

interface NodeProps {
  value: Plain
  path: Path
  defaults: Plain
  onChange: (path: Path, value: Plain) => void
  depth: number
}

const idFor = (path: Path) => `f-${path.join("-")}`

function ListControls({
  index,
  length,
  onMove,
  onRemove,
  canRemove,
}: {
  index: number
  length: number
  onMove: (from: number, to: number) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Дээш" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Доош"
        disabled={index === length - 1}
        onClick={() => onMove(index, index + 1)}
      >
        <ArrowDown />
      </Button>
      {canRemove && (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Устгах" className="text-destructive" onClick={onRemove}>
          <Trash2 />
        </Button>
      )}
    </div>
  )
}

function ArrayNode({ value, path, defaults, onChange, depth }: NodeProps & { value: Plain[] }) {
  const defaultItems = Array.isArray(defaults) ? defaults : []
  const sample = defaultItems.length ? defaultItems : value
  const growable = isGrowable(path, sample)
  const shape = itemShape(sample) as Plain

  const move = (from: number, to: number) => {
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(path, next)
  }
  const remove = (index: number) => onChange(path, value.filter((_, i) => i !== index))
  const add = () => {
    const item: Plain = isPlainObject(shape) ? { ...(shape as Record<string, Plain>), ...("id" in shape ? { id: newId() } : {}) } : ""
    onChange(path, [...value, item])
  }

  if (typeof shape === "string") {
    return (
      <div className="flex flex-col gap-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <TextInput id={idFor([...path, index])} value={typeof item === "string" ? item : ""} onChange={(text) => onChange([...path, index], text)} />
            </div>
            {growable && <ListControls index={index} length={value.length} onMove={move} onRemove={() => remove(index)} canRemove />}
          </div>
        ))}
        {growable && (
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={add}>
            <Plus data-icon="inline-start" /> Мөр нэмэх
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, index) => {
        const itemDefaults = (isPlainObject(item) && typeof item.id === "string"
          ? defaultItems.find((d) => isPlainObject(d) && d.id === item.id)
          : defaultItems[index]) ?? shape
        const withShape = isPlainObject(item) && isPlainObject(shape) && growable ? { ...(shape as Record<string, Plain>), ...item } : item
        return (
          <details
            key={isPlainObject(item) && typeof item.id === "string" ? item.id : index}
            className="group rounded-lg border bg-card"
            // Анх нээх: ганц мөртэй эсвэл шинээр нэмсэн (нэргүй) мөр. Дараа нь хэрэглэгч өөрөө нээж хаана.
            ref={(element) => {
              if (!element || element.dataset.ready) return
              element.dataset.ready = "1"
              if ((depth === 0 && value.length <= 1) || itemTitle(item, index).startsWith("#")) element.open = true
            }}
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium select-none [&::-webkit-details-marker]:hidden">
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{itemTitle(item, index)}</span>
              {growable && (
                <span onClick={(event) => event.preventDefault()}>
                  <ListControls index={index} length={value.length} onMove={move} onRemove={() => remove(index)} canRemove />
                </span>
              )}
            </summary>
            <div className="border-t p-3 sm:p-4">
              <Node value={withShape} path={[...path, index]} defaults={itemDefaults} onChange={onChange} depth={depth + 1} />
            </div>
          </details>
        )
      })}
      {growable && (
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={add}>
          <Plus data-icon="inline-start" /> Шинээр нэмэх
        </Button>
      )}
    </div>
  )
}

function Node({ value, path, defaults, onChange, depth }: NodeProps) {
  const key = path[path.length - 1]
  const id = idFor(path)

  if (key === "price") {
    return (
      <Input
        id={id}
        type="number"
        min={0}
        step={1000}
        inputMode="numeric"
        value={typeof value === "number" ? value : ""}
        placeholder="Тохиролцоно"
        onChange={(event) => onChange(path, event.target.value === "" ? null : Number(event.target.value))}
      />
    )
  }
  if (key === "photo" && typeof value === "string") return <PhotoInput id={id} value={value} onChange={(url) => onChange(path, url)} />
  if (typeof value === "string") return <TextInput id={id} value={value} onChange={(text) => onChange(path, text)} />
  if (typeof value === "boolean") {
    return (
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(path, event.target.checked)}
        className="size-4 accent-primary"
      />
    )
  }
  if (Array.isArray(value)) return <ArrayNode value={value} path={path} defaults={defaults} onChange={onChange} depth={depth} />
  if (isPlainObject(value)) {
    const entries = Object.entries(value as Record<string, Plain>).filter(
      ([childKey, child]) => (!isLocked(childKey) || childKey === "price") && !isHidden([...path, childKey]) && child !== undefined && (typeof child !== "number" || childKey === "price")
    )
    return (
      <div className="flex flex-col gap-4">
        {entries.map(([childKey, child]) => {
          const childPath = [...path, childKey]
          const nested = Array.isArray(child) || isPlainObject(child)
          const childDefaults = getAt(defaults, [childKey]) as Plain
          if (typeof child === "boolean") {
            return (
              <label key={childKey} className="flex items-center gap-2 text-sm font-medium">
                <Node value={child} path={childPath} defaults={childDefaults} onChange={onChange} depth={depth} />
                {keyLabel(childKey)}
              </label>
            )
          }
          return nested ? (
            <fieldset key={childKey} className={cn("flex flex-col gap-3", depth > 0 && "rounded-lg border border-dashed p-3")}>
              <legend className="mb-1 px-1 text-sm font-semibold">{keyLabel(childKey)}</legend>
              <Node value={child} path={childPath} defaults={childDefaults} onChange={onChange} depth={depth + 1} />
            </fieldset>
          ) : (
            <div key={childKey} className="flex flex-col gap-1.5">
              <label htmlFor={idFor(childPath)} className="text-sm font-medium">
                {keyLabel(childKey)}
              </label>
              <Node value={child} path={childPath} defaults={childDefaults} onChange={onChange} depth={depth} />
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

export function ContentEditor({
  sectionKey,
  fields,
  updatedAt,
}: {
  sectionKey: string
  fields: EditorField[]
  updatedAt: string | null
}) {
  const initial = Object.fromEntries(fields.map((field) => [field.key, field.value])) as Values
  const [values, setValues] = useState<Values>(initial)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<{ kind: "ok" | "error"; message: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  const change = (path: Path, value: Plain) => {
    const [fieldKey, ...rest] = path as [string, ...Path]
    setValues((current) => ({ ...current, [fieldKey]: setAt(current[fieldKey], rest, value) }))
    setDirty(true)
    setStatus(null)
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveContentAction(sectionKey, values)
      if (result.ok) {
        setDirty(false)
        setStatus({ kind: "ok", message: "Хадгалагдлаа. Вебсайт дээр шинэчлэгдсэн." })
      } else setStatus({ kind: "error", message: result.message })
    })

  const reset = () =>
    startTransition(async () => {
      const result = await resetContentAction(sectionKey)
      setConfirmReset(false)
      if (result.ok) {
        setValues(Object.fromEntries(fields.map((field) => [field.key, field.defaults])) as Values)
        setDirty(false)
        setStatus({ kind: "ok", message: "Анхны текст рүү буцаалаа." })
      } else setStatus({ kind: "error", message: result.message })
    })

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field) => (
        <section key={field.key} className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="text-lg font-semibold">{field.title}</h2>
          <Node value={values[field.key]} path={[field.key]} defaults={field.defaults} onChange={change} depth={0} />
        </section>
      ))}

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4">
        <Button type="button" onClick={save} disabled={pending || !dirty}>
          {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}
          Хадгалах
        </Button>
        {confirmReset ? (
          <span className="flex flex-wrap items-center gap-2 text-sm">
            Энэ хэсгийн бүх засвар устаж, кодын анхны текст сэргэнэ.
            <Button type="button" variant="destructive" size="sm" onClick={reset} disabled={pending}>
              Тийм, буцаах
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
              Болих
            </Button>
          </span>
        ) : (
          <Button type="button" variant="ghost" onClick={() => setConfirmReset(true)} disabled={pending || !updatedAt}>
            <RotateCcw data-icon="inline-start" /> Анхны текст рүү буцаах
          </Button>
        )}
        <p role="status" className={cn("text-sm", status?.kind === "error" ? "text-destructive" : "text-muted-foreground")}>
          {status ? (
            <span className="inline-flex items-center gap-1.5">
              {status.kind === "ok" && <Check className="size-4 text-primary" aria-hidden />}
              {status.message}
            </span>
          ) : dirty ? (
            "Хадгалаагүй өөрчлөлт байна."
          ) : updatedAt ? (
            `Сүүлд засварласан: ${formatTime(updatedAt)}`
          ) : (
            "Кодын анхны текст ашиглагдаж байна."
          )}
        </p>
      </div>
    </div>
  )
}
