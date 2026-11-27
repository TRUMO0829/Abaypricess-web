import { assessment, assessmentPage } from "@/content/assessment"
import { authContent } from "@/content/auth"
import { bookingContent } from "@/content/booking"
import { company } from "@/content/company"
import { contactInfoContent, contactPage, requestFormContent } from "@/content/contact"
import { hero, heroCards, homeSections } from "@/content/home"
import { footerNav, mainNav, notFoundContent, requestCta, servicesMenuAll } from "@/content/navigation"
import { privacyPolicy } from "@/content/privacy"
import { flowLabels, flowStages } from "@/content/process"
import { reportPageContent, reportTemplates } from "@/content/report"
import { serviceDetailContent, services, servicesPageContent } from "@/content/services"
import { cvLabels, team, teamSection } from "@/content/team"

/**
 * Кодонд бичигдсэн анхны (default) агуулга. Админы засвар (`site_content`) үүн дээр давхарлагдана —
 * засаагүй хэсэг, icon, id, холбоос зэрэг засагдахгүй утга эндээс ирнэ.
 */
export const defaultContent = {
  company,
  hero,
  heroCards,
  homeSections,
  teamSection,
  team,
  cvLabels,
  services,
  servicesPageContent,
  serviceDetailContent,
  flowStages,
  flowLabels,
  mainNav,
  requestCta,
  footerNav,
  servicesMenuAll,
  notFoundContent,
  contactPage,
  requestFormContent,
  contactInfoContent,
  bookingContent,
  authContent,
  assessmentPage,
  assessment,
  reportTemplates,
  reportPageContent,
  privacyPolicy,
}

export type ContentKey = keyof typeof defaultContent
