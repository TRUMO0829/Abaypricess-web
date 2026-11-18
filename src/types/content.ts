// Сайтын бүх агуулгын гэрээ (contract). `src/content/*` эдгээр төрлийг дагана.
// Өөрчлөлт хэрэгтэй бол coordinator (abaya-pricing-website-setup)-д хүсэлт илгээнэ.
import type { LucideIcon } from "lucide-react"

export type ServiceSlug = "training" | "laboratory" | "update"

export interface NavItem {
  label: string
  href: string
  description?: string
  children?: NavItem[]
}

export interface ValueItem {
  icon: LucideIcon
  title: string
  description: string
}

export interface ContactInfo {
  phone: string
  email: string
  address: string
  hours: string
}

export interface Company {
  name: string
  nameEn: string
  legalName: string
  tagline: string
  intro: string
  mission: string
  vision: string
  values: ValueItem[]
  contact: ContactInfo
}

/** Процесс диаграммын (docs/brief/process-diagram.png) нэг баган. */
export interface FlowStage {
  id: ServiceSlug
  lane: string
  action: string
  document: string
  href: string
  icon: LucideIcon
}

/** Үйлчилгээний дэлгэрэнгүй процессын нэг алхам. */
export interface ProcessStep {
  id: string
  title: string
  summary: string
  details: string[]
  deliverable?: string
  duration?: string
}

/** Сургалтын хөтөлбөр (зөвхөн training үйлчилгээнд). */
export interface Program {
  id: string
  title: string
  description: string
  topics: string[]
  duration: string
  format: string
}

/** Үнийн санал. `price: null` бол "Тохиролцоно" гэж харуулна. */
export interface PricePackage {
  id: string
  name: string
  description: string
  price: number | null
  priceSuffix?: string
  features: string[]
  popular?: boolean
  cta: string
}

export interface Service {
  slug: ServiceSlug
  order: number
  name: string
  nameEn: string
  icon: LucideIcon
  shortDescription: string
  description: string
  benefits: string[]
  process: ProcessStep[]
  programs?: Program[]
  /** Сургагч багш нар (Сургагч багш tab) */
  trainers?: TeamMember[]
  packages: PricePackage[]
  /** Диаграмм дээрх баримтын нэр, ж: "Сургалтын үйлчилгээ, үнийн санал" */
  deliverable: string
}

export interface TeamMember {
  name: string
  role: string
  /** `public/team/` доторх зураг, ж: "/team/bat.jpg". Байхгүй бол нэрийн эхний үсэг харагдана. */
  photo?: string
  summary: string
  /** CV: ажлын туршлага */
  experience: string[]
  /** CV: ур чадвар */
  expertise: string[]
}
export interface ReportMetric {
  label: string
  value: string
  /** 0–100, жишээ графикийн баганын өндөр */
  score?: number
}

export interface ReportSection {
  id: string
  title: string
  description: string
  items?: string[]
}

export interface ReportTemplate {
  service: ServiceSlug
  title: string
  subtitle: string
  metrics: ReportMetric[]
  sections: ReportSection[]
}
