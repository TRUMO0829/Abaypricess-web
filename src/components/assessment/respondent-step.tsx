"use client"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { assessmentPage } from "@/content/assessment"
import { employeeOptions, type RespondentFormValues } from "@/lib/assessment/schema"
import { cn } from "@/lib/utils"

const t = assessmentPage.respondent

export type RespondentErrors = Partial<Record<keyof RespondentFormValues, string>>

interface RespondentStepProps {
  values: RespondentFormValues
  errors: RespondentErrors
  onChange: (values: RespondentFormValues) => void
}

type TextField = Exclude<keyof RespondentFormValues, "employees">

const fields: {
  name: TextField
  label: string
  required: boolean
  type?: string
  autoComplete?: string
  placeholder?: string
}[] = [
  { name: "organization", label: t.organization, required: true, autoComplete: "organization" },
  { name: "industry", label: t.industry, required: false, placeholder: t.industryPlaceholder },
  { name: "name", label: t.name, required: true, autoComplete: "given-name", placeholder: t.namePlaceholder },
  { name: "position", label: t.position, required: true, autoComplete: "organization-title", placeholder: t.positionPlaceholder },
  { name: "email", label: t.email, required: true, type: "email", autoComplete: "email", placeholder: "name@company.mn" },
  { name: "phone", label: t.phone, required: true, type: "tel", autoComplete: "tel", placeholder: "9911 2233" },
]

export function RespondentStep({ values, errors, onChange }: RespondentStepProps) {
  const errorId = (name: string) => (errors[name as keyof RespondentErrors] ? `${name}-error` : undefined)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <Field key={field.name} data-invalid={!!errors[field.name]}>
          <FieldLabel htmlFor={field.name}>
            {field.label}{" "}
            {field.required ? (
              <span aria-hidden>*</span>
            ) : (
              <span className="font-normal text-muted-foreground">{assessmentPage.optional}</span>
            )}
          </FieldLabel>
          <Input
            id={field.name}
            type={field.type ?? "text"}
            autoComplete={field.autoComplete}
            placeholder={field.placeholder}
            aria-required={field.required || undefined}
            aria-invalid={!!errors[field.name]}
            aria-describedby={errorId(field.name)}
            value={values[field.name] ?? ""}
            onChange={(event) => onChange({ ...values, [field.name]: event.target.value })}
          />
          <FieldError id={errorId(field.name)} errors={[errors[field.name] ? { message: errors[field.name] } : undefined]} />
        </Field>
      ))}

      <fieldset className="flex min-w-0 flex-col gap-2 sm:col-span-2" data-invalid={!!errors.employees || undefined}>
        <legend className="mb-2 text-sm font-medium">
          {t.employees} <span aria-hidden>*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {employeeOptions.map((option) => (
            <label
              key={option}
              className={cn(
                "relative flex cursor-pointer items-center justify-center rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors",
                "hover:border-primary/50 has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground",
                "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                errors.employees && "border-destructive"
              )}
            >
              <input
                type="radio"
                name="employees"
                value={option}
                checked={values.employees === option}
                onChange={() => onChange({ ...values, employees: option })}
                className="absolute inset-0 cursor-pointer appearance-none rounded-lg opacity-0"
              />
              {option}
            </label>
          ))}
        </div>
        {errors.employees && <p className="text-sm text-destructive">{errors.employees}</p>}
      </fieldset>
    </div>
  )
}
