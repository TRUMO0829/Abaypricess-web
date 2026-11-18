import type {
  AnswerValue,
  Answers,
  Assessment,
  AssessmentQuestion,
  AssessmentSection,
} from "@/types/assessment"

/** Оноонд эзлэх жин (`text` болон weight 0 асуулт оноонд орохгүй). */
export function questionWeight(question: AssessmentQuestion): number {
  if (question.type === "text") return 0
  return Math.max(0, question.weight ?? 1)
}

export function isRequired(question: AssessmentQuestion): boolean {
  return question.required ?? question.type !== "text"
}

export const TEXT_ANSWER_MAX = 2000

/** Хариулт тухайн асуултын төрөлд тохирох эсэх (client болон сервер хоёуланд). */
export function isValidAnswer(question: AssessmentQuestion, value: AnswerValue | undefined): boolean {
  if (value === undefined) return false
  switch (question.type) {
    case "scale":
      return Number.isInteger(value) && (value as number) >= question.min && (value as number) <= question.max
    case "yesno":
      return typeof value === "boolean"
    case "choice":
      return Number.isInteger(value) && (value as number) >= 0 && (value as number) < question.options.length
    case "text":
      return typeof value === "string" && value.trim().length > 0 && value.length <= TEXT_ANSWER_MAX
  }
}

/** Хариултыг 0–1 хооронд хөрвүүлнэ. Оноогүй асуулт эсвэл буруу хариулт → null. */
export function normalizedScore(question: AssessmentQuestion, value: AnswerValue | undefined): number | null {
  if (!isValidAnswer(question, value)) return null
  switch (question.type) {
    case "scale": {
      const ratio = ((value as number) - question.min) / (question.max - question.min || 1)
      return question.reverse ? 1 - ratio : ratio
    }
    case "yesno":
      return (value as boolean) !== Boolean(question.reverse) ? 1 : 0
    case "choice": {
      const points = question.options.map((option) => option.points)
      const min = Math.min(0, ...points)
      const max = Math.max(...points)
      return max === min ? 1 : (points[value as number] - min) / (max - min)
    }
    case "text":
      return null
  }
}

/** Хүнд ойлгомжтой хариулт: "4 / 5", "Тийм", сонголтын нэр, текст. */
export function answerLabel(question: AssessmentQuestion, value: AnswerValue | undefined): string {
  if (value === undefined) return ""
  switch (question.type) {
    case "scale":
      return `${value} / ${question.max}`
    case "yesno":
      return value ? "Тийм" : "Үгүй"
    case "choice":
      return question.options[value as number]?.label ?? ""
    case "text":
      return String(value)
  }
}

/** Хариулаагүй заавал асуултууд. */
export function missingRequired(section: AssessmentSection, answers: Answers): AssessmentQuestion[] {
  return section.questions.filter((q) => isRequired(q) && !isValidAnswer(q, answers[q.id]))
}

export interface SectionScore {
  id: string
  title: string
  /** 0–100, оноотой асуулт байхгүй бол null */
  score: number | null
  answered: number
  questions: number
}

export interface AssessmentScore {
  /** Бүх асуултын жинлэсэн дундаж, 0–100 */
  total: number | null
  sections: SectionScore[]
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** Жинлэсэн оноо: Σ(жин × оноо) / Σ(жин) × 100. Хариулаагүй асуулт 0 оноо авна. */
export function scoreAssessment(assessment: Assessment, answers: Answers): AssessmentScore {
  let totalWeight = 0
  let totalPoints = 0
  const sections = assessment.sections.map((section) => {
    let weight = 0
    let points = 0
    let answered = 0
    for (const question of section.questions) {
      const value = answers[question.id]
      if (isValidAnswer(question, value)) answered += 1
      const w = questionWeight(question)
      if (w === 0) continue
      weight += w
      points += w * (normalizedScore(question, value) ?? 0)
    }
    totalWeight += weight
    totalPoints += points
    return {
      id: section.id,
      title: section.title,
      score: weight > 0 ? round1((points / weight) * 100) : null,
      answered,
      questions: section.questions.length,
    }
  })
  return { total: totalWeight > 0 ? round1((totalPoints / totalWeight) * 100) : null, sections }
}

/** Бүх асуултыг хэвтээ жагсаалт болгоно (id давхардлыг шалгах, хайлтад). */
export function allQuestions(assessment: Assessment): AssessmentQuestion[] {
  return assessment.sections.flatMap((section) => section.questions)
}
