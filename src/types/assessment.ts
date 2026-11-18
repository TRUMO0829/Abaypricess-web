// Байгууллагын үнэлгээний асуулгын гэрээ (contract). Асуултууд `src/content/assessment.ts`-д.

interface QuestionBase {
  /** Тогтвортой id ("lead-01"). Хадгалсан хариулт id-аар холбогдох тул нийтэлсний дараа өөрчлөхгүй. */
  id: string
  text: string
  /** Тайлбар, жишээ (заавал биш) */
  hint?: string
  /**
   * Нийт оноонд эзлэх жин. 0 бол оноонд орохгүй. Default: 1.
   * Ж: weight 3 асуулт нь weight 1 асуултаас 3 дахин их нөлөөлнө.
   */
  weight?: number
  /** Default: true (`text` төрөлд default: false) */
  required?: boolean
}

/** Шатлалын үнэлгээ, ж: 1 (огт санал нийлэхгүй) … 5 (бүрэн санал нийлнэ) */
export interface ScaleQuestion extends QuestionBase {
  type: "scale"
  min: number
  max: number
  minLabel?: string
  maxLabel?: string
  /** Сөрөг утгатай асуулт: их утга = муу (оноог эсрэгээр тооцно) */
  reverse?: boolean
}

/** Тийм / Үгүй. Тийм = бүтэн оноо (`reverse` бол Үгүй = бүтэн оноо) */
export interface YesNoQuestion extends QuestionBase {
  type: "yesno"
  reverse?: boolean
}

/** Сонголттой. Сонголт бүр өөрийн оноотой; хамгийн их оноотой сонголт = бүтэн оноо. */
export interface ChoiceQuestion extends QuestionBase {
  type: "choice"
  options: { label: string; points: number }[]
}

/** Чөлөөт хариулт — оноонд орохгүй, зөвлөхүүдэд мэдээлэл болно. */
export interface TextQuestion extends QuestionBase {
  type: "text"
  placeholder?: string
}

export type AssessmentQuestion = ScaleQuestion | YesNoQuestion | ChoiceQuestion | TextQuestion

export interface AssessmentSection {
  id: string
  title: string
  description?: string
  questions: AssessmentQuestion[]
}

export interface Assessment {
  /** Асуулгыг өөрчлөх бүрт ахиулна — хадгалсан хариулт аль хувилбарт хамаарахыг тодорхойлно */
  version: string
  sections: AssessmentSection[]
}

/**
 * Хариултын утга: scale → тоо, yesno → boolean, choice → сонголтын индекс, text → текст.
 * Хариулаагүй асуулт объектод байхгүй.
 */
export type AnswerValue = number | boolean | string
export type Answers = Record<string, AnswerValue>
